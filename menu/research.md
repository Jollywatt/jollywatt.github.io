---
layout: default
title: Research
permalink: research
---

# Research

<div>
{% for post in site.categories.research %}
	<div class="posts-container">
		{% include post-title.html %}
		{% if post.image %}
			<div class="thumbnail-container">
				<a href="{{ site.github.url }}{{ post.url }}"><img src="{{ site.github.url }}/assets/img/{{ post.image }}"></a>
			</div>
		{% endif %}
		<p>
			{{ post.content }}
			<!-- <a href="{{ site.github.url }}{{ post.url }}">Read more</a> -->
		</p>
	</div>
	<hr>
{% endfor %}
</div>