from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from PIL import Image
from io import BytesIO
import time, win32gui, win32con, os, hashlib

class math_handler():
    def __init__(self):
        # wait for login
        self.driver = webdriver.Chrome()
        self.driver.get("https://www.mathway.com/Algebra")
        self.window_titles = {}
        self.max_tries = 100
        self.try_count = 0
        self.screenshot_count = 0
        self.screenshot_part_height = 400
        self.offset_top = 85
        self.offset_bottom = 85
        self.script_scroll = 'document.querySelector(\'[class="popup-pad"]\').scrollTo(0, {HEIGHT})'
        self.full_path = ""
        self.filename_start = self.full_path + "answer_part_"
        self.question_file = self.full_path + "question.txt"
        self.buf_size = 65536
        self.file_hash = None
        self.main_url = 'https://www.mathway.com/Algebra'
        self.hash_check_file_timeout = 4
        

    # get button by class name and innerText
    def get_button(self, class_name, search_text, return_all=False):
        elms = self.driver.find_elements_by_class_name(class_name)
        solution_buttons = []
        for elm in elms:
            if search_text in elm.text:
                solution_buttons.append(elm)

        if return_all == True:
            return solution_buttons
        else:
            return solution_buttons[-1]

    # get browser window
    def get_browser_window(self):
        # window handler
        def window_handler(hand, ctx):
            if win32gui.IsWindowVisible(hand):
                self.window_titles[win32gui.GetWindowText(hand)] = hand
                
        win32gui.EnumWindows(window_handler, None)

        # find browser window
        for title in self.window_titles.keys():
            if "Mathway" in title:
                hand = self.window_titles[title]
                self.window_titles = {}
                return hand

    # screenshot handler
    def take_current_screenshot(self, screenshot_height, top_offset, bottom_offset):
        # take screenshot
        content = self.driver.find_element_by_id('visitor-area')
        location = content.location
        size = content.size
        png = self.driver.get_screenshot_as_png()
        img = Image.open(BytesIO(png))

        # crop screenshot
        self.left = location['x']
        self.right = location['x'] + size['width']
        self.top = location['y']
        self.bottom = location['y'] + size['height']
        bottom = screenshot_height + bottom_offset

        # save screenshot
        file_name = self.filename_start+str(self.screenshot_count) + ".png"
        img = img.crop((self.left, top_offset, self.right, bottom))
        img.save(file_name)
        self.screenshot_count += 1
        
    # take screenshot of solution
    def take_screenshot(self):
        self.screenshot_count = 0
        
        # scroll to top of div
        self.driver.execute_script(self.script_scroll.replace('{HEIGHT}', str(0)))
        time.sleep(0.1)

        # screenshot
        self.take_current_screenshot(self.screenshot_part_height, self.offset_top, self.offset_bottom)
        height_of_div = self.bottom
        self.full_screenshots_count = int(height_of_div / self.screenshot_part_height)
        for i in range(1, self.full_screenshots_count):
            # scroll then take screenshot
            self.driver.execute_script(self.script_scroll.replace('{HEIGHT}', str(self.screenshot_part_height*i)))
            time.sleep(0.1)
            self.take_current_screenshot(self.screenshot_part_height, self.offset_top, self.offset_bottom)
            time.sleep(0.1)

        # final screenshot
        #final_height = height_of_div - (self.screenshot_part_height * self.full_screenshots_count)
        #self.take_current_screenshot(self.screenshot_part_height, final_height, final_height-r.offset_bottom)
        # hide final screenshot for now as it doesn't line up
        
        # minimise window after complete
        time.sleep(1)
        window = self.get_browser_window()
        win32gui.ShowWindow(window, win32con.SW_MINIMIZE)

    # merge images
    def merage_images(self, output_filename='output.png'):
        # get files
        gen = [i if i[0:len(self.filename_start)]==self.filename_start else None for i in os.listdir()]
        images = sorted(list(filter(None, gen)))
        
        imgs = [Image.open(i) for i in images]
        min_img_width = min(i.width for i in imgs)
        total_height = 0

        # get image heights
        for i, img in enumerate(imgs):
            if img.width > min_img_width:
                imgs[i] = img.resize((min_img_width, int(img.height / img.width * min_img_width)), Image.ANTIALIAS)
            total_height += imgs[i].height

        # merge images
        img_merge = Image.new(imgs[0].mode, (min_img_width, total_height))
        y = 0
        for img in imgs:
            img_merge.paste(img, (0, y))
            y += img.height

        # save image
        img_merge.save(output_filename)

    # delete images
    def delete_images(self):
        # get files
        gen = [i if i[0:len(self.filename_start)]==self.filename_start else None for i in os.listdir()]
        for img in sorted(list(filter(None, gen))):
            os.remove(img)

    # hash file check if it changed
    def check_if_file_changed(self, filename, algorth=hashlib.md5):
        # generate hash
        hash_func = algorth()
        with open(filename, 'rb') as file:
            while True:
                data = file.read(self.buf_size)
                if not data:
                    break
                hash_func.update(data)

        # check hashs
        current = hash_func.hexdigest()
        previous = self.file_hash
        if self.file_hash == None:
            self.file_hash = current
            return False
        else:
            if current == previous:
                self.file_hash = current
                return False
            else:
                self.file_hash = current
                return True
        
    # handle text question input
    def submit_question_text(self):
        # load webpage
        if self.driver.current_url != self.main_url:
            self.driver.get(self.main_url)
            time.sleep(8)
        
        # type question
        question = open(self.question_file, "r").read()
        div = self.driver.find_element_by_id('editor')
        self.driver.implicitly_wait(10)
        ActionChains(self.driver).move_to_element(div).send_keys(question).perform()
        print("[+] Typed question!")

        # submit question
        time.sleep(2)
        script1 = 'document.querySelectorAll(\'button[aria-label="submit your problem"][class="enabled"]\')[0].click();'
        self.driver.execute_script(script1)
        time.sleep(5) # wait for it to think of answer
        print("[+] Clicked submit button!")

        # hide solution popup
        try:
            time.sleep(1)
            sol_pop = r.driver.find_element_by_id('topics-inner')
            sol_pop.find_element_by_class_name('topics-single').click()
        except: print("[-] no popup was shown")

        # get solution page
        self.get_button('ch-bubble-action', "view steps").click()
        print("[+] Clicked view steps button!")

        # click all more step buttons
        time.sleep(2) # wait for solution page to load
        self.try_count = 0
        more_steps = self.get_button('visitor-more-steps', 'more steps', return_all=True)
        while len(more_steps) > 0:
            more_steps = self.get_button('visitor-more-steps', 'more steps', return_all=True)
            for step_bbtn in more_steps:
                time.sleep(0.1)
                step_bbtn.click()
                
            self.max_tries += 1
            if self.try_count >= self.max_tries:
                break
        print("[+] loaded all more steps buttons!")
            

        # take screenshot
        time.sleep(1)
        self.take_screenshot()
        print("[+] took screenshot!")

        # merge screenshot
        self.merage_images()
        print("[+] merged screenshots!")

        # delete screenshot files
        self.delete_images()
        print("[+] deleted screenshots!")

        # close solution popup
        time.sleep(0.1)
        close_div = self.driver.find_elements_by_class_name("popup-close")[0]
        self.driver.implicitly_wait(10)
        ActionChains(self.driver).move_to_element(close_div).click().perform()
        print("[+] closed solution dialog!")

    def login(self):
        input("Please login then press enter to continue...")

def test():
    try:
        r = math_handler()
        f = open(r.question_file)
        f.close()
        r.driver.quit()
        print("passed test!")
    except Exception as error:
        print(err)
    finally:
        input("Press enter to quit!")
#test()

#main
r = math_handler()
r.login()

while True:
    if r.check_if_file_changed(r.question_file) == True:
        try:
            print("[+] Started Solving equation!")
            r.submit_question_text()
            print("[+] Successfully finished solving equation!")
        except:
            print("[-] Failed to solve equation!")
    time.sleep(r.hash_check_file_timeout)

# enter users question
# wait for answer
# screenshot the answer in main window
# screenshow the workings out
# send to user
