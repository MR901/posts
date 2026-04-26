=================================================
Custom Domain Routing with Cloudflare Workers
=================================================

This document explains how to serve multiple GitHub Pages repositories under a single custom domain using Cloudflare Workers as a reverse proxy.

Overview
========

**What this achieves**: Multiple GitHub Pages repos accessible under one custom domain with different subpaths.

**Example**:

- ``https://mr901.co.in/posts/`` → serves ``https://mr901.github.io/posts/``
- ``https://mr901.co.in/projects/`` → serves ``https://mr901.github.io/projects/``
- ``https://mr901.co.in/`` → serves ``https://mr901.github.io/``

**Key benefit**: Users only see your custom domain, while all content remains hosted on GitHub Pages (free hosting).

Architecture Overview
=====================

The Problem
-----------

GitHub Pages has limitations when using custom domains:

1. **One domain per repo**: You can set a custom domain like ``mr901.co.in`` for one repo, but not for multiple repos
2. **No subpath support**: GitHub Pages serves repos at the root (``/``) or at ``/<repo-name>/``, but you cannot mount multiple repos under different subpaths of the same custom domain
3. **Routing limitation**: If you point ``mr901.co.in`` to GitHub, you can only serve one repository there

**Result**: Without a solution, you would need separate subdomains for each repo (``posts.mr901.co.in``, ``projects.mr901.co.in``), which is not ideal for a unified portfolio/blog site.

The Solution
------------

**Cloudflare Worker as a transparent reverse proxy**:

A Cloudflare Worker is a serverless function that runs at the edge (Cloudflare's CDN). It intercepts HTTP requests to your domain before they reach any server, allowing you to programmatically route requests to different destinations.

**Request Flow**:

1. User types ``https://mr901.co.in/posts/my-article/`` in browser
2. Request reaches Cloudflare's network (since domain DNS points to Cloudflare)
3. **Worker intercepts** the request before any server handles it
4. Worker examines the URL path (``/posts/my-article/``)
5. Worker **fetches** content from ``https://mr901.github.io/posts/my-article/``
6. Worker **returns** the GitHub Pages response to the user's browser
7. Browser displays content, user sees ``mr901.co.in`` in address bar

**Analogy**: Think of the Cloudflare Worker as a **smart receptionist** or **mail forwarding service**:

- When mail (HTTP request) arrives addressed to ``mr901.co.in/posts/``, the receptionist knows to forward it to the "posts department" at ``mr901.github.io/posts/``
- When mail arrives for ``mr901.co.in/projects/``, it forwards to the "projects department" at ``mr901.github.io/projects/``
- The sender (user) never knows where the mail actually went—they only see the ``mr901.co.in`` address

**Key Benefits**:

- All repos stay on **GitHub Pages** (free hosting, free CDN, automatic SSL)
- Worker runs on **Cloudflare's free tier** (100,000 requests/day)
- **No code changes** needed in your Jekyll sites
- Each repo **deploys independently** on GitHub
- Easy to **scale**: add new repos by adding 3 lines to Worker code
- Users only see your **custom domain**, GitHub is invisible

Why This Approach
=================

**Cost**: Free
   - GitHub Pages: free for public repos
   - Cloudflare Workers: free tier includes 100,000 requests/day (sufficient for most personal sites)
   - Total monthly cost: **$0**

**Simplicity**: Minimal maintenance
   - One small Worker script (~15 lines of code)
   - No servers to manage
   - No complex deployment pipelines
   - Add new repos in 2 minutes

**Scalability**: Grows with you
   - Add unlimited repos by adding a few lines to Worker
   - Each repo can be any size GitHub Pages supports
   - Worker handles routing for all repos

**Independence**: Each repo stands alone
   - Deploy repos separately on GitHub
   - No coordination needed between repos
   - Each repo can use different Jekyll themes/configs
   - Easy to delete/archive old repos

**Professional appearance**:
   - Users see unified domain (``mr901.co.in``)
   - Looks like one cohesive site
   - Hides implementation details

Prerequisites
=============

Before starting, ensure you have:

1. **Custom domain** (e.g., ``mr901.co.in``)
   - Purchased from any domain registrar (GoDaddy, Namecheap, etc.)
   - Access to domain's DNS settings

2. **Cloudflare account** (free tier is sufficient)
   - Sign up at https://cloudflare.com

3. **GitHub Pages repository** already working
   - Example: ``https://mr901.github.io/posts/`` serving content correctly
   - Jekyll site building successfully on GitHub Actions

4. **Basic understanding** of:
   - DNS records (A, CNAME)
   - GitHub Pages deployment
   - Browser developer tools (optional, for troubleshooting)

Step-by-Step Setup
==================

Step 1: Add Domain to Cloudflare
---------------------------------

1. **Sign in to Cloudflare** (https://dash.cloudflare.com)
2. Click **"Add a Site"** or **"Add site"** button
3. **Enter your domain**: ``mr901.co.in``
4. Click **"Add site"**
5. **Select a plan**: Choose **"Free"** plan
6. Cloudflare will scan your existing DNS records (if any)
7. **Review DNS records**: Cloudflare shows records it found
   - You can keep or modify these later
   - Click **"Continue"**
8. **Update nameservers at your domain registrar**:

   Cloudflare provides two nameservers like::

     ns1.cloudflare.com
     ns2.cloudflare.com

   **Go to your domain registrar** (GoDaddy, Namecheap, etc.):

   - Log in to your registrar account
   - Find DNS/Nameserver settings
   - Replace existing nameservers with Cloudflare's nameservers
   - Save changes

9. **Wait for activation** (usually 5-30 minutes, can take up to 24 hours)

10. Cloudflare will email you when the domain is active

Step 2: Configure DNS Records
------------------------------

Once your domain is active on Cloudflare:

1. Go to **Cloudflare Dashboard** → Select your domain → Click **"DNS"** → **"Records"** tab

2. **Add or verify A records** for GitHub Pages:

   You should have these **4 A records** (GitHub Pages IPs)::

     Type: A
     Name: @ (or your domain like "mr901.co.in")
     IPv4 address: 185.199.108.153
     Proxy status: Proxied (orange cloud)
     TTL: Auto

     Type: A
     Name: @
     IPv4 address: 185.199.109.153
     Proxy status: Proxied (orange cloud)
     TTL: Auto

     Type: A
     Name: @
     IPv4 address: 185.199.110.153
     Proxy status: Proxied (orange cloud)
     TTL: Auto

     Type: A
     Name: @
     IPv4 address: 185.199.111.153
     Proxy status: Proxied (orange cloud)
     TTL: Auto

3. **(Optional) Add CNAME for www**::

     Type: CNAME
     Name: www
     Target: mr901.co.in (or @)
     Proxy status: Proxied (orange cloud)
     TTL: Auto

4. **Important**: Ensure **Proxy status** shows **orange cloud** (Proxied)
   - This is critical! Gray cloud (DNS only) won't work with Workers
   - Click the cloud icon to toggle between Proxied and DNS only

**Note**: Even though these A records point to GitHub's IPs, the Worker will intercept requests before they reach GitHub, so this is the correct setup.

Step 3: Create Cloudflare Worker
---------------------------------

1. In **Cloudflare Dashboard**, click **"Compute & AI"** then **"Workers & Pages"** in left sidebar

2. Click **"Create Application"** button (top right)

3. Click **"Start with Hello World"**

4. **Name your Worker**: Enter a meaningful name
   - Example: ``domain-router`` or ``mr901-router``
   - Name must be lowercase, can contain hyphens
   - Click **"Deploy"**

5. You'll see "Success!" message after deployment

6. Click **"Edit Code"** button (top right)

7. You'll see default "Hello World" code in the editor

8. **Select all the default code and DELETE it**

9. **Paste the Worker code** (see Section 6 below for the code)

10. **Critical**: Click **"Save and Deploy"** button (top right)
    - Note: There are two buttons—"Save" and "Deploy"
    - You must click **"Save and Deploy"** or just **"Deploy"** to actually deploy
    - Just clicking "Save" will NOT deploy your changes!

11. Wait for confirmation message "Successfully deployed"

Step 4: Configure Worker Routes
--------------------------------

Now connect the Worker to your domain:

1. In the Worker page, click **"Settings"** tab

2. Scroll to **"Triggers"** section

3. Under **"Routes"**, click **"Add route"** button

4. **Enter route pattern**:

   - **Route**: ``mr901.co.in/*``
     (This pattern matches all paths under your domain)

   - Alternative for subdomains too: ``*mr901.co.in/*``
     (Matches ``mr901.co.in`` and all subdomains like ``www.mr901.co.in``)

5. **Select zone**: Choose your domain (``mr901.co.in``) from dropdown

6. Click **"Add route"** or **"Save"**

7. Route should now appear in the Routes list

**What this does**: Every HTTP request to ``mr901.co.in/*`` will now be handled by your Worker before anything else.

Step 5: Test the Setup
-----------------------

**Important**: Always test in a **private/incognito window** first to avoid browser cache issues!

Initial Testing
~~~~~~~~~~~~~~~

1. **Wait 30 seconds** for Worker deployment to propagate

2. **Open a private/incognito browser window**:

   - **Chrome/Edge**: ``Ctrl + Shift + N`` (Windows) or ``Cmd + Shift + N`` (Mac)
   - **Firefox**: ``Ctrl + Shift + P`` (Windows) or ``Cmd + Shift + P`` (Mac)
   - **Safari**: ``Cmd + Shift + N`` (Mac)

3. **Visit your URLs** to test:

   - ``https://mr901.co.in/posts`` (without trailing slash)
   - ``https://mr901.co.in/posts/`` (with trailing slash)
   - ``https://mr901.co.in/resume`` (without trailing slash)
   - ``https://mr901.co.in/resume/`` (with trailing slash)

4. **Expected behavior**:

   - URLs without trailing slash should redirect to version with trailing slash
   - URL bar should **always** show ``mr901.co.in`` (never ``github.io``)
   - Content loads correctly with proper styling

5. **Check the URL bar**: Should show ``mr901.co.in/posts/`` or ``mr901.co.in/resume/``, NOT ``github.io``

6. **Test multiple pages**:

   - Visit a specific post URL
   - Click links to navigate
   - Check if images/CSS/JS load correctly

Clearing Cache (If Testing in Regular Browser)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you're testing in a regular browser window and see old behavior (redirects to homepage, shows ``github.io`` URL, etc.), you need to clear cache:

**Option 1: Hard Refresh** (Quick)

- **Chrome/Edge**: ``Ctrl + Shift + R`` (Windows) or ``Cmd + Shift + R`` (Mac)
- **Firefox**: ``Ctrl + F5`` (Windows) or ``Cmd + Shift + R`` (Mac)
- **Safari**: ``Cmd + Option + R`` (Mac)

**Option 2: Clear Site Data** (More thorough)

1. Open **Developer Tools** (F12)
2. Go to **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Right-click on your domain in the left sidebar
4. Click **"Clear site data"** or **"Clear all"**
5. Refresh the page

**Option 3: Clear Cloudflare Cache** (Nuclear option)

1. Go to **Cloudflare Dashboard** → Your domain → **Caching** → **Configuration**
2. Click **"Purge Everything"** button
3. Confirm the purge
4. Wait 30 seconds
5. Clear browser cache (Option 1 or 2 above)
6. Test again

Developer Tools Testing
~~~~~~~~~~~~~~~~~~~~~~~~

For detailed debugging:

1. **Open browser Developer Tools** (F12)

2. **Network Tab**:

   - Open Network tab BEFORE loading the page
   - Visit your URL
   - Look for the first request (the HTML document)
   - Check the **Status Code**: Should be ``301`` for URLs without trailing slash, ``200`` for URLs with trailing slash
   - Check the **Location header** in redirects: Should point to your custom domain, NOT ``github.io``

3. **Console Tab**:

   - Look for any errors (red messages)
   - Common issues: 404s for assets, CORS errors, mixed content warnings

4. **Headers inspection**:

   - Click on any request in Network tab
   - Go to **Headers** sub-tab
   - Verify ``cf-cache-status`` header shows Cloudflare is handling the request

Command-Line Testing (Advanced)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Test with ``curl`` to see raw HTTP behavior without browser cache:

.. code-block:: bash

   # Test redirect behavior (without trailing slash)
   curl -sI https://mr901.co.in/posts | grep -E "(HTTP|location:)"
   
   # Should show:
   # HTTP/2 301
   # location: https://mr901.co.in/posts/

   # Test direct access (with trailing slash)
   curl -sI https://mr901.co.in/posts/ | grep -E "(HTTP|location:)"
   
   # Should show:
   # HTTP/2 200

   # Follow redirects and see final URL
   curl -sL -w "Final URL: %{url_effective}\n" -o /dev/null https://mr901.co.in/posts
   
   # Should show:
   # Final URL: https://mr901.co.in/posts/

**Why Cache is an Issue**:

Browser and Cloudflare both cache redirects. When you update your Worker code, old cached redirects may still send users to wrong locations. **Always test in incognito/private window first** to verify the Worker is working correctly before troubleshooting cache issues.

If Incognito Works But Regular Browser Doesn't
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This confirms it's a cache issue:

1. The Worker is functioning correctly
2. Your regular browser has cached old redirect data
3. Solution: Clear browser cache using methods above
4. Future updates: Always test in incognito first, then clear cache in regular browser

Worker Code
===========

Complete Worker code with Location header rewriting (REQUIRED for proper redirects):

.. code-block:: javascript

   export default {
      async fetch(request, env, ctx) {
         const url = new URL(request.url);
         const path = url.pathname;

         let githubUrl;
         
         // Route /posts/* to your posts GitHub Pages
         if (path.startsWith('/posts')) {
            githubUrl = `https://mr901.github.io${path}${url.search}`;
         }
         // Route /resume/* to your resume GitHub Pages
         else if (path.startsWith('/resume')) {
            githubUrl = `https://mr901.github.io${path}${url.search}`;
         }
         // Route /tools/* to GitHub Pages with path rewriting
         else if (path.startsWith('/tools/')) {
            // Remove /tools prefix: /tools/paint/ → /paint/
            const rewrittenPath = path.replace(/^\/tools/, '');
            githubUrl = `https://mr901.github.io${rewrittenPath}${url.search}`;
         }
         // Default: serve main GitHub Pages site
         else {
            githubUrl = `https://mr901.github.io${path}${url.search}`;
         }

         // Fetch from GitHub Pages
         const response = await fetch(githubUrl, request);

         // Create a new response to modify headers
         const newResponse = new Response(response.body, response);

         // Rewrite Location header in redirects to use custom domain
         const location = newResponse.headers.get('Location');
         if (location && location.includes('mr901.github.io')) {
            let newLocation = location.replace('mr901.github.io', 'mr901.co.in');  // ✅ Changed to 'let'

            // Also rewrite paths: /paint/ → /tools/paint/
            newLocation = newLocation.replace('/paint/', '/tools/paint/');
            newLocation = newLocation.replace('/paint', '/tools/paint');

            newResponse.headers.set('Location', newLocation);
         }

         return newResponse;
      }
   };

**Code Explanation**:

``export default``
   Standard ES module export for Cloudflare Workers

``async fetch(request, env, ctx)``
   The main function that handles every HTTP request

   - ``request``: Incoming HTTP request object from user's browser
   - ``env``: Environment variables and bindings (not used here)
   - ``ctx``: Execution context (not used here)

``const url = new URL(request.url)``
   Parse the request URL into components

   Example: ``https://mr901.co.in/posts/my-article/?page=2``

``const path = url.pathname``
   Extract the path from URL

   Example: ``/posts/my-article/``

``let githubUrl``
   Declare variable to store the target GitHub Pages URL

``if (path.startsWith('/posts'))``
   Check if the path begins with ``/posts``

   - Matches: ``/posts``, ``/posts/``, ``/posts/my-article/``
   - Doesn't match: ``/projects``, ``/about``, ``/``

``else if (path.startsWith('/resume'))``
   Check if the path begins with ``/resume``

   - Handles your resume section
   - Can add more routes using additional ``else if`` blocks

``const githubUrl = `https://mr901.github.io${path}${url.search}```
   Construct the GitHub Pages URL

   - ``path``: the path (e.g., ``/posts/my-article/``)
   - ``url.search``: query parameters (e.g., ``?page=2``)
   - Result: ``https://mr901.github.io/posts/my-article/?page=2``

``const response = await fetch(githubUrl, request)``
   Fetch content from GitHub Pages

   - Makes HTTP request to GitHub with the same method, headers, and body
   - Waits for response before continuing (``await``)

``const newResponse = new Response(response.body, response)``
   Create a new Response object to allow header modification

   - Copies the response body and all properties from GitHub's response
   - Allows us to modify headers before returning to user

``const location = newResponse.headers.get('Location')``
   Check if response contains a Location header

   - Location headers are used in HTTP redirects (301, 302, etc.)
   - GitHub Pages redirects ``/posts`` → ``/posts/`` with Location header

``if (location && location.includes('mr901.github.io'))``
   Check if redirect points to GitHub Pages

   - Only modify Location header if it exists AND points to your GitHub domain
   - Prevents modifying unrelated redirects

``const newLocation = location.replace('mr901.github.io', 'mr901.co.in')``
   Rewrite the redirect URL to use custom domain

   - Changes: ``https://mr901.github.io/posts/`` → ``https://mr901.co.in/posts/``
   - **CRITICAL**: Without this, users would see ``github.io`` URLs when redirected
   - Example: ``/posts`` redirects to ``/posts/``, but stays on ``mr901.co.in``

``newResponse.headers.set('Location', newLocation)``
   Update the Location header with the rewritten URL

``return newResponse``
   Return the modified response to the user's browser

**Why Location Header Rewriting is Essential**:

Without Location header rewriting, here's what happens:

1. User visits: ``https://mr901.co.in/posts`` (no trailing slash)
2. Worker forwards to: ``https://mr901.github.io/posts``
3. GitHub Pages responds: ``301 Redirect → Location: https://mr901.github.io/posts/``
4. Worker passes this redirect as-is to browser
5. Browser follows redirect to: ``https://mr901.github.io/posts/`` (exposes GitHub URL!)
6. User sees ``github.io`` in address bar ❌

With Location header rewriting:

1. User visits: ``https://mr901.co.in/posts`` (no trailing slash)
2. Worker forwards to: ``https://mr901.github.io/posts``
3. GitHub Pages responds: ``301 Redirect → Location: https://mr901.github.io/posts/``
4. Worker rewrites Location to: ``https://mr901.co.in/posts/``
5. Browser follows redirect to: ``https://mr901.co.in/posts/`` (custom domain!)
6. User sees ``mr901.co.in`` in address bar ✓

**Fallback at the end**: If no specific route matches, the ``else`` block serves content from ``mr901.github.io`` at the same path.

How It Works (User Experience)
===============================

Understanding the User Journey
-------------------------------

**Without Worker** (why we need it)::

  1. User types: https://mr901.co.in/posts/
  2. Browser looks up DNS → Points to GitHub Pages IPs
  3. Request goes to GitHub Pages servers
  4. GitHub Pages server says: "I only know about mr901.github.io, not mr901.co.in/posts/"
  5. Result: 404 Not Found error

**With Worker** (how it solves the problem)::

  1. User types: https://mr901.co.in/posts/my-article/
  2. Browser looks up DNS → Points to Cloudflare (proxied)
  3. Request reaches Cloudflare's network
  4. **Worker intercepts** before any backend server
  5. Worker checks: "Path starts with /posts? Yes!"
  6. Worker fetches: https://mr901.github.io/posts/my-article/
  7. GitHub Pages responds with HTML, CSS, JS, images
  8. Worker returns GitHub's response to user
  9. User's browser displays content
  10. **URL bar still shows**: https://mr901.co.in/posts/my-article/

**What the user experiences**:

- Visits ``mr901.co.in/posts/``
- Sees your blog posts
- URL bar shows ``mr901.co.in``
- Everything loads normally (images, styles, scripts)
- Clicking links works perfectly
- **Never knows GitHub is involved**

Post Office Analogy
--------------------

Think of it like a **mail forwarding service**:

1. You have a PO Box address: ``mr901.co.in`` (your "public" address)

2. You have multiple actual offices at different locations:
   - Office 1: ``mr901.github.io/posts`` (handles blog content)
   - Office 2: ``mr901.github.io/projects`` (handles project pages)
   - Office 3: ``mr901.github.io`` (handles main site)

3. The **Cloudflare Worker is the post office clerk**:
   - Receives all mail sent to ``mr901.co.in``
   - Reads the destination: "Oh, this is for the /posts office!"
   - Forwards mail to ``mr901.github.io/posts``
   - Gets response from that office
   - Delivers response back to sender
   - Sender never knows about the actual office location

4. From sender's perspective:
   - Sent letter to: ``mr901.co.in/posts``
   - Got response from: ``mr901.co.in/posts``
   - Clean and simple!

Scaling to Multiple Repositories
=================================

The beauty of this setup: **adding new repos is trivial**.

Adding a New Repository
------------------------

Let's say you create a new GitHub repository for your projects portfolio.

**Step 1**: Set up the new repo on GitHub Pages

1. Create repository: ``projects``
2. Enable GitHub Pages in repo settings
3. Verify it works at: ``https://mr901.github.io/projects/``

**Step 2**: Update Worker code

Edit your Worker and add this route after the ``/resume`` route (before the ``else`` block):

.. code-block:: javascript

   // Route /projects/* to your projects GitHub Pages
   else if (path.startsWith('/projects')) {
     githubUrl = `https://mr901.github.io${path}${url.search}`;
   }

**Note**: Make sure to keep the Location header rewriting logic at the end! The full structure should be:

1. Declare ``let githubUrl``
2. Add all your route conditions (``if``, ``else if``, ``else``)
3. Fetch from GitHub
4. Rewrite Location header
5. Return response

**Step 3**: Deploy

Click **"Save and Deploy"** in Worker editor.

**Step 4**: Test

Visit ``https://mr901.co.in/projects/`` — it should work immediately!

**That's it!** No DNS changes, no configuration files, no complicated deployments.

Full Example with Multiple Repos
---------------------------------

Here's what your Worker looks like with multiple repos (with Location header rewriting):

.. code-block:: javascript

   export default {
     async fetch(request, env, ctx) {
       const url = new URL(request.url);
       const path = url.pathname;

       let githubUrl;

       // Blog posts
       if (path.startsWith('/posts')) {
         githubUrl = `https://mr901.github.io${path}${url.search}`;
       }
       // Resume/CV
       else if (path.startsWith('/resume')) {
         githubUrl = `https://mr901.github.io${path}${url.search}`;
       }
       // Projects portfolio
       else if (path.startsWith('/projects')) {
         githubUrl = `https://mr901.github.io${path}${url.search}`;
       }
       // Documentation site
       else if (path.startsWith('/docs')) {
         githubUrl = `https://mr901.github.io${path}${url.search}`;
       }
       // Photography gallery
       else if (path.startsWith('/gallery')) {
         githubUrl = `https://mr901.github.io${path}${url.search}`;
       }
       // Default: serve main site
       else {
         githubUrl = `https://mr901.github.io${path}${url.search}`;
       }

       // Fetch from GitHub Pages
       const response = await fetch(githubUrl, request);

       // Create a new response to modify headers
       const newResponse = new Response(response.body, response);

       // Rewrite Location header in redirects to use custom domain
       const location = newResponse.headers.get('Location');
       if (location && location.includes('mr901.github.io')) {
         const newLocation = location.replace('mr901.github.io', 'mr901.co.in');
         newResponse.headers.set('Location', newLocation);
       }

       return newResponse;
     }
   };

**Result**:

- ``mr901.co.in/posts/`` → Blog
- ``mr901.co.in/resume/`` → Resume/CV
- ``mr901.co.in/projects/`` → Projects
- ``mr901.co.in/docs/`` → Documentation
- ``mr901.co.in/gallery/`` → Photos
- ``mr901.co.in/`` → Main landing page

All from **one Worker**, all repos on **free GitHub Pages**, all under **one domain**.

**Key Benefits of This Structure**:

- Each repository can be developed and deployed independently
- Adding new sections requires only updating the Worker (3 lines)
- Redirects work correctly and maintain custom domain visibility
- No complex build processes or monorepo management needed

Advanced: Path Rewriting
=========================

When Custom Domain Path Doesn't Match GitHub Pages Path
---------------------------------------------------------

Sometimes you want to serve a GitHub Pages site at a different path on your custom domain:

- **GitHub Pages**: ``https://mr901.github.io/paint/`` (repository name: ``paint``)
- **Custom Domain**: ``https://mr901.co.in/tools/paint/`` (nested under ``/tools/``)

This requires **path rewriting** in your Worker.

Use Case Example
~~~~~~~~~~~~~~~~

You have multiple tool repositories on GitHub:

- ``https://mr901.github.io/paint/`` → Want at: ``mr901.co.in/tools/paint/``
- ``https://mr901.github.io/calculator/`` → Want at: ``mr901.co.in/tools/calculator/``
- ``https://mr901.github.io/editor/`` → Want at: ``mr901.co.in/tools/editor/``

Worker Code with Path Rewriting
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

   export default {
     async fetch(request, env, ctx) {
       const url = new URL(request.url);
       const path = url.pathname;

       let githubUrl;
       
       // Route /posts/* to your posts GitHub Pages
       if (path.startsWith('/posts')) {
         githubUrl = `https://mr901.github.io${path}${url.search}`;
       }
       // Route /resume/* to your resume GitHub Pages
       else if (path.startsWith('/resume')) {
         githubUrl = `https://mr901.github.io${path}${url.search}`;
       }
       // Route /tools/* with path rewriting
       // /tools/paint/ → /paint/
       // /tools/calculator/ → /calculator/
       else if (path.startsWith('/tools/')) {
         // Remove /tools prefix
         const rewrittenPath = path.replace(/^\/tools/, '');
         githubUrl = `https://mr901.github.io${rewrittenPath}${url.search}`;
       }
       // Default: serve main GitHub Pages site
       else {
         githubUrl = `https://mr901.github.io${path}${url.search}`;
       }

       // Fetch from GitHub Pages
       const response = await fetch(githubUrl, request);

       // Create a new response to modify headers
       const newResponse = new Response(response.body, response);

       // Rewrite Location header in redirects
       const location = newResponse.headers.get('Location');
       if (location && location.includes('mr901.github.io')) {
         let newLocation = location.replace('mr901.github.io', 'mr901.co.in');
         
         // CRITICAL: Also rewrite paths in redirects
         // /paint/ → /tools/paint/
         // /calculator/ → /tools/calculator/
         newLocation = newLocation.replace('/paint/', '/tools/paint/');
         newLocation = newLocation.replace('/paint', '/tools/paint');
         newLocation = newLocation.replace('/calculator/', '/tools/calculator/');
         newLocation = newLocation.replace('/calculator', '/tools/calculator');
         newLocation = newLocation.replace('/editor/', '/tools/editor/');
         newLocation = newLocation.replace('/editor', '/tools/editor');
         
         newResponse.headers.set('Location', newLocation);
       }

       return newResponse;
     }
   };

How Path Rewriting Works
~~~~~~~~~~~~~~~~~~~~~~~~~

**Request Flow**:

1. User visits: ``https://mr901.co.in/tools/paint/index.html``
2. Worker receives: ``pathname = "/tools/paint/index.html"``
3. Worker checks: Path starts with ``/tools/`` → Yes!
4. Worker rewrites: ``"/tools/paint/index.html"`` → ``"/paint/index.html"``
5. Worker fetches: ``https://mr901.github.io/paint/index.html``
6. GitHub Pages responds with content
7. Worker checks for Location header and rewrites if needed
8. User sees content at ``mr901.co.in/tools/paint/index.html``

**Path Transformation Examples**:

.. list-table::
   :header-rows: 1
   :widths: 40 40 20

   * - User Requests
     - Worker Fetches From
     - Result
   * - ``mr901.co.in/tools/paint/``
     - ``mr901.github.io/paint/``
     - ✓
   * - ``mr901.co.in/tools/paint/app.js``
     - ``mr901.github.io/paint/app.js``
     - ✓
   * - ``mr901.co.in/tools/calculator/``
     - ``mr901.github.io/calculator/``
     - ✓
   * - ``mr901.co.in/posts/article/``
     - ``mr901.github.io/posts/article/``
     - ✓ (no rewriting)

Important: Asset Path Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When using path rewriting, your application's asset references matter:

**Relative Paths (Recommended)**

If your app uses relative paths, it works automatically:

.. code-block:: html

   <!-- In /tools/paint/index.html -->
   <link rel="stylesheet" href="./style.css">
   <script src="./app.js"></script>

Browser resolves: ``./style.css`` → ``/tools/paint/style.css`` ✓

**Absolute Paths (Requires Configuration)**

If your app uses absolute paths referencing the original GitHub path:

.. code-block:: html

   <!-- This WON'T work with path rewriting -->
   <link rel="stylesheet" href="/paint/style.css">
   <script src="/paint/app.js"></script>

Browser tries to fetch: ``mr901.co.in/paint/style.css`` (404 - no route!)

**Solution for Jekyll Sites**:

Update ``_config.yml`` in your repository:

.. code-block:: yaml

   url: "https://mr901.co.in"
   baseurl: "/tools/paint"  # Use the custom domain path, not GitHub path

**Solution for Static HTML/JS Apps**:

1. Use relative paths (``./``, ``../``) instead of absolute paths (``/``)
2. Or use a build tool to inject the base path
3. Or configure your app's router with the correct base path

Testing Path Rewriting
~~~~~~~~~~~~~~~~~~~~~~~

**Command-line testing**:

.. code-block:: bash

   # Test the rewritten path works
   curl -sI https://mr901.co.in/tools/paint/ | grep -E "(HTTP|location:)"
   
   # Should return HTTP/2 200 or redirect to mr901.co.in (not github.io)

   # Test assets load correctly
   curl -sI https://mr901.co.in/tools/paint/style.css | grep HTTP
   
   # Should return HTTP/2 200

**Browser testing** (always use incognito first):

1. Visit ``https://mr901.co.in/tools/paint/``
2. Open DevTools (F12) → Network tab
3. Refresh page
4. Check all assets return 200 status
5. Verify no 404 errors
6. Confirm URL bar shows ``mr901.co.in`` (not ``github.io``)

When to Use Path Rewriting
~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Use path rewriting when**:

- You want to organize repos under logical categories (``/tools/``, ``/demos/``, ``/projects/``)
- Multiple repos share similar purposes and should be grouped
- You want cleaner, more semantic URLs
- You're migrating from one URL structure to another

**Don't use path rewriting when**:

- Simple 1:1 path mapping works (``/posts`` → ``/posts``)
- You have complex nested paths that would require many rewrite rules
- Your app heavily relies on absolute paths and can't be easily reconfigured

**Pro Tip**: For most use cases, creating GitHub repositories with the exact path you want on your custom domain is simpler than path rewriting. Only use path rewriting when you have a specific need for it.

Adding More Path Rewrites
~~~~~~~~~~~~~~~~~~~~~~~~~~

To add another tool:

1. **Create GitHub repo**: ``my-tool``
2. **Enable GitHub Pages**: Verify works at ``https://mr901.github.io/my-tool/``
3. **Add to Location header rewrites**:

   .. code-block:: javascript

      newLocation = newLocation.replace('/my-tool/', '/tools/my-tool/');
      newLocation = newLocation.replace('/my-tool', '/tools/my-tool');

4. **Deploy Worker**: Click "Save and Deploy"
5. **Test**: ``https://mr901.co.in/tools/my-tool/``

The ``/tools/`` route already handles all tools automatically - you only need to add the Location header rewriting for proper redirects!

Jekyll Configuration
====================

Good news: **No special configuration needed** for the Worker!

Keep Your Standard GitHub Pages Config
---------------------------------------

In your Jekyll site's ``_config.yml``, keep the standard GitHub Pages setup:

.. code-block:: yaml

   url: "https://mr901.github.io"
   baseurl: "/posts"

**Or**, you can use your custom domain:

.. code-block:: yaml

   url: "https://mr901.co.in"
   baseurl: "/posts"

**Both work!** The Worker transparently proxies everything, so Jekyll doesn't need to know about it.

Why This Works
--------------

Jekyll uses ``site.url`` and ``site.baseurl`` to generate URLs for:

- Asset paths (CSS, JS, images)
- Internal links between posts
- Navigation menus
- Pagination

With ``baseurl: "/posts"``, Jekyll generates URLs like::

  /posts/assets/css/style.css
  /posts/2025-11-04-my-post/
  /posts/page/2/

When a user visits ``mr901.co.in/posts/``:

1. Worker fetches from ``mr901.github.io/posts/``
2. GitHub Pages serves HTML with paths like ``/posts/assets/css/style.css``
3. Browser sees these paths and requests ``mr901.co.in/posts/assets/css/style.css``
4. Worker intercepts again and fetches from ``mr901.github.io/posts/assets/css/style.css``
5. Everything works seamlessly!

No Changes Needed
-----------------

You don't need to:

- Rebuild your Jekyll site
- Update any asset paths
- Modify any links
- Change deployment workflows
- Install special plugins

Your existing GitHub Pages setup works as-is with the Worker.

Troubleshooting
===============

Redirects to Homepage or Shows github.io URL
---------------------------------------------

**Problem**: When you visit ``https://mr901.co.in/posts`` (without trailing slash), you get redirected to the homepage OR the URL bar shows ``mr901.github.io`` instead of ``mr901.co.in``.

**Cause**: Worker is not rewriting the Location header in redirects from GitHub Pages.

**Why this happens**:

1. GitHub Pages redirects URLs without trailing slash to versions with trailing slash
2. The redirect Location header contains ``https://mr901.github.io/posts/``
3. If Worker doesn't rewrite this header, browser follows redirect to GitHub URL
4. User ends up on wrong page or sees ``github.io`` in address bar

**Solution**:

1. Verify your Worker includes Location header rewriting code:

   .. code-block:: javascript

      // Create a new response to modify headers
      const newResponse = new Response(response.body, response);

      // Rewrite Location header in redirects
      const location = newResponse.headers.get('Location');
      if (location && location.includes('mr901.github.io')) {
        const newLocation = location.replace('mr901.github.io', 'mr901.co.in');
        newResponse.headers.set('Location', newLocation);
      }

      return newResponse;

2. Update your Worker with the correct code from the "Worker Code" section
3. **Critical**: Click **"Save and Deploy"**
4. Clear Cloudflare cache: Dashboard → Caching → Purge Everything
5. Test in **incognito/private window** first to avoid browser cache
6. If incognito works but regular browser doesn't: Clear browser cache (Ctrl+Shift+R)

**To verify it's working**:

.. code-block:: bash

   curl -sI https://mr901.co.in/posts | grep location:
   
   # Should show: location: https://mr901.co.in/posts/
   # NOT: location: https://mr901.github.io/posts/

Seeing "Hello World!" Message
------------------------------

**Problem**: When you visit ``https://mr901.co.in/posts/``, you see "Hello World!" text.

**Cause**: Worker is running, but still has the default code (not your proxy code).

**Solution**:

1. Go to **Workers & Pages** → Click your Worker
2. Click **"Edit Code"**
3. Verify you see the proxy code (with ``if (path.startsWith('/posts'))`` etc.)
4. If you see "Hello World" code, replace it with the proxy code from Worker Code section
5. **Critical**: Click **"Save and Deploy"** (not just "Save")
6. Wait 10-20 seconds for deployment
7. Clear browser cache and try again (Ctrl+Shift+R or test in incognito)

404 Not Found Errors
--------------------

**Problem**: Visiting ``https://mr901.co.in/posts/`` shows 404 error.

**Possible causes and solutions**:

1. **GitHub Pages not working**:

   - First test: ``https://mr901.github.io/posts/``
   - If this shows 404, fix GitHub Pages first
   - Check GitHub repo settings → Pages is enabled
   - Check GitHub Actions build succeeded

2. **Wrong route pattern**:

   - Go to Worker → Settings → Triggers → Routes
   - Verify pattern is: ``mr901.co.in/*`` (with your actual domain)
   - Pattern must match exactly
   - Save if you made changes

3. **Worker not deployed**:

   - Verify "Last deployed" timestamp is recent
   - Redeploy if needed

DNS / Domain Not Resolving
---------------------------

**Problem**: Browser says "DNS_PROBE_FINISHED_NXDOMAIN" or similar.

**Cause**: Domain not properly configured in Cloudflare.

**Solution**:

1. Check nameservers at your registrar point to Cloudflare
2. In Cloudflare Dashboard → Overview → Verify status is "Active"
3. If status is "Pending", wait for DNS propagation (can take 24 hours)
4. Test DNS: ``nslookup mr901.co.in`` should show Cloudflare IPs

Assets Not Loading (Broken CSS/JS)
-----------------------------------

**Problem**: Page loads but looks broken, CSS/images missing.

**Cause**: Jekyll ``baseurl`` configuration issue.

**Solution**:

1. Open browser Developer Tools (F12) → Console tab
2. Look for 404 errors on asset files
3. Note the paths browser is trying to load
4. Check your Jekyll ``_config.yml``:

   .. code-block:: yaml

      baseurl: "/posts"  # Must match your GitHub Pages path

5. Rebuild Jekyll site: ``bundle exec jekyll build``
6. Push to GitHub and wait for Pages to rebuild

Worker Not Triggering
----------------------

**Problem**: Visiting domain doesn't trigger Worker (shows GitHub error or default page).

**Cause**: DNS record not proxied through Cloudflare.

**Solution**:

1. Go to **DNS** → **Records**
2. Find your A record(s) for ``@`` or your domain
3. **Check Proxy status**: Must show **orange cloud** (Proxied)
4. If showing **gray cloud** (DNS only), click it to enable Proxy
5. Wait 30 seconds and try again

Slow Response Times
-------------------

**Problem**: Pages load slowly (>2 seconds).

**Cause**: Worker adds minimal latency (~10-50ms), but GitHub Pages might be slow.

**Solutions**:

1. **Check GitHub Pages status**: https://www.githubstatus.com
2. **Optimize Jekyll site**:

   - Minimize asset sizes
   - Use CDN for large files
   - Enable Jekyll asset compression

3. **Monitor Worker performance**:

   - Cloudflare Dashboard → Workers & Pages → Your Worker → Metrics
   - Check "Worker Invocation Duration"

4. **Note**: Worker itself is very fast (edge computing), slowness usually comes from GitHub Pages response time

Certificate / SSL Errors
-------------------------

**Problem**: Browser shows "Your connection is not private" or SSL certificate warnings.

**Cause**: SSL certificate not provisioned or DNS not propagated.

**Solution**:

1. **Check SSL status**:

   - Cloudflare Dashboard → SSL/TLS
   - Verify SSL/TLS encryption mode is "Full" or "Flexible"
   - Check certificate status is "Active"

2. **Wait for certificate provisioning** (usually 15 minutes to 24 hours for new domains)

3. **Universal SSL** should be enabled by default on free plan

4. Try forcing HTTPS:

   - SSL/TLS → Edge Certificates → "Always Use HTTPS": ON

Changes Not Appearing
----------------------

**Problem**: Updated Worker code but changes don't appear when visiting site.

**Causes and solutions**:

1. **Didn't click "Deploy"**:

   - In Worker editor, you MUST click **"Save and Deploy"**
   - "Save" alone doesn't deploy!

2. **Browser cache**:

   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Or open in Incognito/Private window

3. **Cloudflare cache**:

   - Dashboard → Caching → Configuration → **"Purge Everything"**
   - Wait 30 seconds and try again

Cost and Limits
================

Cloudflare Workers Free Tier
-----------------------------

**Included in free tier**:

- **100,000 requests per day** (3 million per month)
- 10ms CPU time per request
- Up to 100 Workers scripts
- Global deployment (all Cloudflare data centers)

**Limits**:

- If you exceed 100k requests/day, Worker stops serving until next day
- For most personal blogs/portfolios, this is more than enough

**Paid tier** (if you need more):

- $5/month
- 10 million requests/month included
- Additional requests: $0.50 per million

GitHub Pages
------------

**Free tier** (public repos):

- Unlimited sites
- 100 GB bandwidth per month
- 1 GB storage per site
- 10 builds per hour

**Note**: For high-traffic sites (>100k visitors/month), consider upgrading or using a CDN.

Total Cost for Most Users
--------------------------

**Personal blog/portfolio with <100k visitors/month**: **$0**

**Example traffic scenarios**:

.. list-table::
   :header-rows: 1
   :widths: 30 30 20 20

   * - Site Type
     - Monthly Pageviews
     - Requests/Day
     - Cost
   * - Personal blog
     - 10,000
     - ~3,300
     - $0
   * - Active blog
     - 50,000
     - ~16,600
     - $0
   * - Popular blog
     - 200,000
     - ~66,600
     - $0
   * - High-traffic
     - 500,000
     - ~166,600
     - $5/month

**Note**: Each pageview generates multiple requests (HTML, CSS, JS, images), so actual Worker requests are 3-5x pageviews. The calculations above account for this.

Additional Resources
====================

Official Documentation
-----------------------

**Cloudflare Workers**:

- Getting Started: https://developers.cloudflare.com/workers/get-started/
- Workers Documentation: https://developers.cloudflare.com/workers/
- Examples: https://developers.cloudflare.com/workers/examples/

**GitHub Pages**:

- GitHub Pages Documentation: https://docs.github.com/en/pages
- Configuring a custom domain: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

**Jekyll**:

- Jekyll Documentation: https://jekyllrb.com/docs/
- Configuration: https://jekyllrb.com/docs/configuration/
- Chirpy Theme: https://github.com/cotes2020/jekyll-theme-chirpy

Community Resources
-------------------

- Cloudflare Community: https://community.cloudflare.com/
- GitHub Pages Community: https://github.com/orgs/community/discussions/categories/pages
- Jekyll Community: https://talk.jekyllrb.com/

Related Documentation in This Repository
-----------------------------------------

- ``README.rst``: General project setup and development workflow
- ``_config.yml``: Jekyll configuration options
- ``Makefile``: Available commands for building and deploying

Support
-------

For issues specific to this repository setup, please open an issue on GitHub.

For Cloudflare-specific questions, consult the Cloudflare Workers documentation or community forums.

For Jekyll/GitHub Pages questions, refer to official documentation links above.

