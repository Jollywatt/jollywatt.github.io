#metadata((
  date: datetime(year: 2023, month: 04, day: 24),
  blub: [
    My favourite characterisation of (information) entropy with a ‘composition law’, and a uniqueness proof.  ],
  categories: ("maths",),
))

#let img(src, style) = {
  let dest = "/assets/" + src
  metadata((asset: path(src), to: dest))
  html.img(src: dest, style: style.text)
}

#show math.equation.where(block: true): it => {
  html.div(html.frame(it), style: ```css
    display: flex;
    justify-content: center;
  ```.text)
}

#show math.equation.where(block: false): it => {
  box(html.frame(it))
}

#show math.slash: math.op
#show math.tilde: math.class.with("normal")

The mathematical definition of _entropy_ is often hard to motivate, coming across as rather mysterious.
But it can be uniquely characterised with a very natural and pretty ‘composition law’, which anyone could come up with.

#html.hr()

*Theorem:* The formula for _information entropy_
$
  H(bold(p)) = - K sum_i bold(p)_i log_2 bold(p)_i
$
is the _unique_ real-valued function of a finite probability distribution $bold(p)$ which:

+ is continuous with respect to $bold(p)$,
+ obeys the _Composition Law_,
+ increases for uniform distributions $bold(p) = (1/n, ..., 1/n)$ as the width $n$ increases,
4. has some fixed value $K$ for a fair coin toss $bold(p) = (1/2, 1/2)$.

The last assumption is merely a choice of units---without it, the function is defined up to an overall scaling factor.

== Motivating the Composition Law

If we wanted to define the 'uncertainty' associated with a distribution, what properties should our measure have?

You can picture a finite probability distribution as a decision tree with weighted branches:


#figure(img("fig-1.png", ```css width: 45%;```))

The same distribution can also be expressed by dividing the decision tree up into a composition of sub-trees:

#figure(img("fig-2.png", ```css width: 50%;```))

Notice that each final outcome still has the same overall probability — all we’ve done is add an extra ‘step’ in the random process.

Since these two pictures represent the same scenario, *we want our uncertainty measure to be the same for both.*
But the second picture has many parts. How do you measure the total uncertainty? By taking a _weighted sum_ of the uncertainties of each sub-tree.

Why a weighted sum?
Consider what should happen when one of the branches’ probabilities goes to zero: the total uncertainty should not include the uncertainty of the sub-tree under that branch, since it is certain that its outcomes won’t happen.

For example, the probability of ${5, 6}$ is $.1$ in the picture, so the total uncertainty contains only a small contribution from the green sub-tree.

Expressing this mathematically, the uncertainty measure $H$ should satisfy

#figure(img("eqn.png", ```css height: 6ex;```))

where the left hand side is the uncertainty of the distribution in the first picture, and the right hand side is the total uncertainty in the second picture.

Note that the probabilities on each branch are still important, but are just too small to draw.

=== Formally

Now we can codify this _composition law_ more formally. Let
$
  bold(p): Omega & → [0, 1] \
  i & ↦ p_i
$
be a finite probability distribution which is normalised so that $sum_(i ∈ Omega) p_i = 1$. Let $~$ be some equivalence relation on the set of outcomes, $Omega$. Define the _quotient_ distribution
$
  bold(p) slash ~ : Omega slash ~ & → [0, 1] \
  [i] & ↦ sum_(j op(~) i) p_j
$
where $[i]$ is the equivalence class of $i$.
This corresponds to taking a distribution and binning the outcomes.
Also define the _restricted_ distributions
$
  bold(p)|_[i] : [i] & → [0, 1] \
  j & ↦ p_j/(sum_(k op(~) j) p_k)
$
which correspond to keeping only a subset of outcomes and renormalising the probabilities.

These fit into the example above where $Omega = {1, ..., 6}$ like so:

#figure(img("fig-3.png", ```css width: 90%;```))

Expressed in this language, the composition law is
$
  H(bold(p)) = H(bold(p) slash ~) + sum_(e ∈ Omega slash ~) (bold(p) slash ~)(e) \, H(bold(p)|_e)
$
where $(bold(p) slash ~)(e) = sum_(i ∈ e) p_i$.


== Proof of Uniqueness

We will prove that any ‘uncertainty’ function $H(bold(p)) ≡ H(p_1, ..., p_n)$ satisfying

1. continuity
2. the composition law
3. the property that $H(1/n, …, 1/n)$ increases with $n$

must be equal to the Shannon entropy
$
  H(bold(p)) = -K sum_i p_i log_2 p_i
$
where $K = H(1/2, 1/2)$.
The proof is in three steps, one for each property above:

1. Show that $H(bold(p))$ is uniquely defined for all distributions $bold(p)$ if it is known for all _rational_ distributions $bold(q) ∈ QQ^n$.
2. Show that $H(bold(q))$ is uniquely defined for all rational distributions $bold(q)$ if the entropy of the uniform distribution
  $U(n) := H(1/2, ... (times n) ..., 1/2)$
  is known for all $n$.
3. Show that $U(n)$ is uniquely defined for all $n$ if we fix $U(2) = K$.

=== Step 1.

This follows by the assumption of continuity. If $bold(p) ∈ ℝ^n$ is the limit a sequence of rational distributions $bold(q)_i ∈ QQ^n$, then by continuity $H(bold(p)) = lim_i H(bold(q)_i)$.

=== Step 2.

Let $bold(q) ∈ QQ^n$ be a rational distribution, and let $D$ be the lowest common denominator of all the probabilities $q_i$, so that
$
  bold(q) = (d_1/D, d_2/D, ..., d_n/D)
$
where $d_i$ are non-negative integers.
Now consider the set $Omega = {1, 2, ..., D}$, and let $bold(r)(i) := 1/D$ be the uniform distribution on $Omega$.
Define an equivalence relation $~$ which partitions $Omega$ into $n$ different sets ${e_1, e_2, ..., e_n}$, where the $i$th set contains $d_i$ elements.
The size of the $i$th equivalence group, as a fraction of the whole, is given by $abs(e_i)/abs(Omega) = d_i/D = q_i$, and we have $bold(r) slash ~ = bold(q)$ by construction.

#figure(img("fig-4.png", ```css width: 100%;```))

From the composition law, we have
$
  H(bold(r)) & = H(bold(r) slash ~) + sum_(i = 1)^n d_i/D H(bold(r)|_(e_i)) \
  U(D) & = H(bold(q)) + sum_(i = 1)^n d_i/D  U(d_i)
$
since $H(bold(r)) = U(D)$ and
$H(bold(r)|_(e_i)) = U(d_i)$.
This shows that $H(bold(q))$ is uniquely defined if $U(n)$ is known for all $n$.

=== Step 3.

We will now show that $U(n)$ is uniquely defined by $U(2)$ by showing that the only possible functions are
$
  U(n) = K log_2 n
$
where $K$ is a free parameter.

Consider a uniform distribution $r$ on ${1, 2, ..., n m}$ partitioned by $~$ into $n$ groups of $m$, so that the $i$th equivalence class is $[n i] = {n i, n i + 1, n i + m - 1}$.
Writing down the composition law for this partition yields
$
  H(bold(r)) & = H(bold(r) slash ~) + sum_(i = 1)^n 1/n H(bold(r)|_{[n i]}) \
  U(n m) & = U(n) + sum_(i = 1)^n 1/n U(m)
$
and hence $U(n m) = U(n) + U(m)$. The only increasing functions $U(n)$ satisfying this property are multiples of $log n$.
By choosing $U(2) := K$, we fix $U(n) = K log_2 n$.


This completes the proof!

In summary, under the three assumptions, knowing $U(2) ≡ H(1/2, 1/2)$ is enough to uniquely define $U(n)$ for all $n$, which is in turn enough to uniquely define $H(bold(q))$ for all rational distributions $bold(q)$, which is enough to define $H$ completely.
