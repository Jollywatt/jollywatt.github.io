---
layout: default
title: Research
permalink: interactive
---

# _Interactive things_

<div>
{% for post in site.categories.interactive %}
	<div class="posts-container">
		{% include post-title.html category=false %}
		{% if post.image or post.coverimage %}
		<div class="thumbnail-container">
		  <a href="{{ site.github.url }}{{ post.url }}"><img src="{{ site.github.url }}/assets/img/{% if post.coverimage %}{{ post.coverimage }}{% else %}{{ post.image }}{% endif %}"></a>
		</div>
		{% endif %}
		<p>
			{{ post.blurb }}
			<a href="{{ site.github.url }}{{ post.url }}">Read more</a>
		</p>
	</div>
	<hr>
{% endfor %}
</div>