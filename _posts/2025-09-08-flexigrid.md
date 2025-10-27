---
layout: post
title: "Layout algorithms for flexigrids"
author: "Joseph Wilson"
categories: research
tags: []
blurb: An exposition of the elastic coordinate system used in fletcher.
---


This post is a development journal entry for the [fletcher](https://typst.app/universe/package/fletcher) package for [Typst](https://typst.app/home).
Fletcher is a diagramming package that lets users place _nodes_ (content) on a _flexigrid_.

Flexigrids are a cross between a table layout and a coordinate grid.
Unlike tables, flexigrids allow fractional coordinates, and unlike Cartesian coordinates, flexigrids automatically grow to accommodate content.

This leads to some interesting puzzles in terms of the best layout algorithm for computing row and column sizes given a set of nodes and their coordinates.


## Method 0: Normal coordinates

The simplest way to lay out nodes on a page is to place them at Cartesian coordinates on a fixed grid.

<figure>
    <img src="{{ site.github.url }}/projects/flexigrids/fig-1.svg">
    <figcaption>Figure 1: Nodes laid out with Cartesian coordinates.</figcaption>
</figure>

## Method 1: Standard table layouts <table-layout>

If we want a table-like layout in which cells grow to accommodate nodes, the simplest approach is to require nodes to have integer coordinates.
The row/column sizes are set to the maximum height/width of the nodes present in that row/column.

<figure>
    <img src="{{ site.github.url }}/projects/flexigrids/fig-2.svg">
</figure>

Cell gutter may then applied by adding a uniform gap between rows and columns.

<figure>
    <img src="{{ site.github.url }}/projects/flexigrids/fig-3.svg">
</figure>

In the presence of cell gutter, the centre positions $$x_0$$ and $$x_1$$ of flexigrid cells of widths $$w_0$$ and $$w_1$$ are constrained by

$$
x_1 - x_0 = g + \frac{w_0 + w_1}2
$$

where $$g \ge 0$$ is the gutter between adjacent cells.


As a layout algorithm, for each node placed we update the cell widths as

$$
  w'_u = \max(w_u, W)
$$

where $$W$$ is the width of the node at position $$u \in \mathbb{Z}$$ and $$w_u$$ is the original cell width at column $$u$$.



## Method 2: Linear interpolation of cell sizes

To allow fractional positioning of nodes, we can define an _elastic_ coordinate system which linearly interpolates between row/column centre points.
If $$u \in \mathbb{R}$$ is an elastic coordinate, then the corresponding physical coordinate is

$$
x_u = (1 - t)x_{\lfloor n\rfloor} + t x_{\lfloor u\rfloor + 1}
$$

where $$t = u - \lfloor u\rfloor \in [0, 1)$$ and $$x_i$$ are the row/column centres for $$i \in \mathbb{Z}$$.

If we place a node of width $$W$$ at $$x_u$$, how do we update the cell sizes?

A simple method is to linearly interpolate the allocation of the width into each cell, according to

$$
\begin{align*}
  w'_0 &= (1 - t)W \\
  w'_1 &= t W \\
\end{align*}
$$

which agrees with @table-layout when $$u \in \mathbb{Z}$$.
The actual cell size is then the maximum of the new size $$w'_i$$ and the original size $$w_i$$ without the node:

$$
  w_i \leftarrow \max(w_i, w'_i)
$$

This works well when there is no gutter between cells:


<figure>
    <img src="{{ site.github.url }}/projects/flexigrids/fig-4.svg">
</figure>


However, placing nodes with cell gutter leads to cells being unnecessarily large:

<figure>
    <img src="{{ site.github.url }}/projects/flexigrids/fig-5.svg">
    <figcaption>Figure 1: Limitations of the linear layout algorithm.</figcaption>
</figure>

Notice that the first column is too wide for $$u = 0.2$$ and the last column is too wide for $$u = 0.8$$. Both columns are too wide for $$u = 0.5$$.

Another way to visualise the problem is with Figure 1 which shows the cell centres $$x_0$$ and $$x_1$$ and widths $$w_0$$ and $$w_1$$ on the horizontal axis as a function of the gutter $$g$$ on the vertical axis.


<figure>
    <img src="{{ site.github.url }}/projects/flexigrids/fig-6.svg">
</figure>


Notice that the cells in Figure 1 (blue and red) reach outside the span of the node, $$W$$.
As the cell gutter $$g$$ increases, the cells contain less of the node yet do not shrink.

<figure>
    <img src="{{ site.github.url }}/projects/flexigrids/fig-7.svg">
    <figcaption>
  Figure 2: Demo of the linear layout algorithm for gradually changing elastic coordinate.
  </figcaption>
</figure>


## Method 3: The _tight_ layout algorithm


To fix the aforementioned problem, we must define the desired layout behaviour taking into account cell gutter.


Consider placing a node of width $$W$$ at elastic coordinate $$0 \le u \le 1$$.
If the span of a cell is fully contained in the span of the node, we want the cell to expand by the maximum amount it can while still being fully contained.
If a cell is not fully contained in the node's span, it does not change size when the node is placed.

This results in the scenario in Figure 3, where the cells separate to respect increasing gutter $$g$$ but also shrink to ensure they stay within the node $$W$$.

<figure>
    <img src="{{ site.github.url }}/projects/flexigrids/fig-8.svg">
    <figcaption>
      Figure 3:
      Node at \(u = 1/3\) of width \(W = 6\) placed with the tight layout algorithm.
    </figcaption>
</figure>

If the cells have an existing positive width, then our picture looks like Figure 4.

<figure>
    <img src="{{ site.github.url }}/projects/flexigrids/fig-9.svg">
    <figcaption>
      Figure 4:
      Node at \(u = 1/3\) of width \(W = 6\) where the blue and red columns have existing widths \(w_0 = 2\) and \(w_1 = 1\).
    </figcaption>
</figure>

To calculate the new cell widths $$w'_0$$ and $$w'_1$$ for a given $$u$$, $$W$$ and $$g$$ along with the original widths $$w_0$$ and $$w_1$$, we first write down the coordinates of the inner edges of the cells.


For the left cell (blue), there are two cases to consider.
- _Fully contained in the node:_
  In this case, the left end of the cell is at the left end of the node, at coordinate $$-W/2$$. The cell width is $$2x_0 + W$$, so the inner end (right) of the cell is at
    
  $$ x_0^\text{inner} = 2x_0 + W/2. $$

- _Not fully contained:_
  In this case, the cell is unaffected and keeps its initial width $$w_0$$.
  The inner (right) end of the cell is then
  
  $$ x_0^\text{inner} = x_0 + w_0/2. $$

The correct end point is the rightmost or maximum of these two.
Similar reasoning applies to the right node (red).

$$
\begin{align*}
  x_0^\text{inner} &= \max{2x_0 + W/2, x_0 + w_0/2} \\
  x_1^\text{inner} &= \min{2x_1 - W/2, x_1 - w_1/2} \\
\end{align*}
$$

The gap between the cells $$g = x_1^\text{inner} - x_0^\text{inner}$$ is therefore

$$
\begin{align*}
  g = \min\{
    & x_1 - x_0 - (w_1 + w_0)/2, 
    && x_1 - 2x_0 - (w_1 + W)/2, \\
    & 2x_1 - x_0 - (W + w_0)/2,
    && 2x_1 - 2x_0 - (W + W)/2\}.
\end{align*}
$$

Remembering that we set $$x_t = 0$$,  we may use $$(1 - t)x_0 + t x_1 = 0$$ to eliminate $$x_1 = (t - 1)/t x_0$$.

$$
\begin{align*}
  g = \min\bigg\{
    & \left(\frac{t - 1}t - 1\right) x_0 - \frac{w_1 + w_0}2,
    && \left(\frac{t - 1}t - 2\right) x_0 - \frac{w_1 + W}2, \\
    & \left(2\frac{t - 1}t - 1\right) x_0 - \frac{W + w_0}2,
    && \left(2\frac{t - 1}t - 2\right) x_0 - \frac{W + W}2\bigg\} \\
\end{align*}
$$

Simplifying this gives

$$
\begin{align*}
  -t g = \max\{
  & x_0 + t(w_1 + w_0)/2,
  && (1 + t) x_0 + t(w_1 + W)/2, \\
  & (2 - t) x_0 + t(W + w_0)/2,
  && 2 x_0 + t W \}
\end{align*}
$$

where the $$\min$$ turns into a $$\max$$ because we multiplied by $$-t \le 0$$.
Notice that the right-hand side is a linear function of $$x_0$$ with positive slope.
We can therefore solve for $$x_0$$ by solving each case independently and taking the maximum solution (prove this to yourself by drawing some lines).

$$
\begin{align*}
x_0 = -\frac{t}{2} \max\bigg\{
  &   2g + w_1 + w_0,
  && \frac{2g + w_1 + W}{1 + t}, \\
  &  \frac{2g + W + w_0}{2 - t},
  && \frac{2g + 2W}{2} \bigg\}
\end{align*}
$$

The new width of the cells are then:

$$
\begin{align*}
  w'_0 &= 2x_0 + W \\
  w'_1 &= 2\left(\frac{t - 1}{t}\right) x_0 - W \\
\end{align*}
$$

Figure 5 demonstrates the tight layout algorithm for various values of $u$.
Notice that, for each example, the centre of the node at $u$ is exactly at the linear interpolation of the cell centres, and that the cells are never too large (always tightly fitting nodes they contain).


<figure>
    <img src="{{ site.github.url }}/projects/flexigrids/fig-10.svg">
    <figcaption>
      Figure 5:
      Example of interpolation with the tight layout algorithm.
    </figcaption>
</figure>


## Summary of layout algorithms


Finding row sizes is identical to finding column sizes (except node width is replaced by height, etc).

To compute column widths, for each node, take its position $$u$$ and width $$W$$ along with the widths of the adjacent columns
$$w_0 \coloneqq w_{\lfloor u_i\rfloor}$$
and
$$w_1 \coloneqq w_{\lfloor u_i\rfloor + 1}$$
.
Update the column widths according to

$$
w_i = \max(w_i, w'_i)
$$

where the new sizes $$w'_0$$ and $$w'_1$$ are given by the layout algorithm, 

$$
(w'_0, w'_1) = \text{Sizer}(t, W, w_0, w_1, g)
,
$$

which takes the fractional part $$t = u - \lfloor u \rfloor$$ of the node's position, the node's width $$W$$ and the original column widths $$w_i$$ as well as the column gutter $$g$$.

- _Linearly interpolated sizes:_

  $$
  \text{Sizer}_\text{Linear}(t, W, w_0, w_1, g) = ((1 - t)W, tW)
  $$

- _Tight layout:_

  $$
  \text{Sizer}_\text{Tight}(t, W, w_0, w_1, g)
    = 
    \begin{cases}
    (W, 0) & \text{ if $t = 0$} \\
    (0, W) & \text{ if $t = 1$} \\
    \left(2x_0 + W, W - 2\left(\frac{t - 1}{t}\right)x_0\right)
    \end{cases}
  $$

  where

  $$
  \begin{align*}
  x_0 = -\frac{t}{2} \max\bigg\{
    &   2g + w_1 + w_0,
    && \frac{2g + w_1 + W}{1 + t}, \\
    &  \frac{2g + W + w_0}{2 - t},
    && \frac{2g + 2W}{2} \bigg\}
  \end{align*}
  $$

It's interesting how ugly the second method is on paper.
But hopefully I'm not alone in believing that it produces nicer results!
