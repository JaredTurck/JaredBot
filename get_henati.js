(function () {
	var urls = document.querySelectorAll('section[id="content"] article[id^="post_"] a[href]')
	var url_array = [];
	for (i=0;i<urls.length;i++) {
		url_array.push(urls[i].getAttribute("href"));
	}
	return url_array;
})();