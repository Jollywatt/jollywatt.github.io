---
layout: default
title: Archive
permalink: /archive
---

# _Archive of posts_

<ul class="posts-container">
  {% for post in site.posts %}
    {% unless post.next %}
      <h3>{{ post.date | date: '%Y' }}</h3>
    {% else %}
      {% capture year %}{{ post.date | date: '%Y' }}{% endcapture %}
      {% capture nyear %}{{ post.next.date | date: '%Y' }}{% endcapture %}
      {% if year != nyear %}
        <h3>{{ post.date | date: '%Y' }}</h3>
      {% endif %}
    {% endunless %}
    <li itemscope>
      <a href="{{ site.github.url }}{{ post.url }}">{{ post.title }}</a>
      <span class="post-date" >
        ·
        <i class="fa fa-calendar" aria-hidden="true"></i> {{ post.date | date: "%B %-d" }} 
        {% for category in post.categories %}
          · {{ category }}
        {% endfor %}
      </span>
    </li>
  {% endfor %}
</ul>
