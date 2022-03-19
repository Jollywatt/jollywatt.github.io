---
layout: default
title: Research
permalink: research
---

# _Research_

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
			{% if post.blurb %}
				{{ post.blurb }}
			{% else %}
				{{ post.content | strip_html | truncatewords: 50 }}
			{% endif %}
			<a href="{{ site.github.url }}{{ post.url }}">Read more</a>
		</p>
	</div>
	<hr>
{% endfor %}
</div>