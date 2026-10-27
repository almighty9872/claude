# The Rosary's 3D beads

`strand.js` draws the whole rosary in 3D on the desktop Rosary screen (tesbih-duasi.html) with three.js:
the five decades in a loop, the pendant to the crucifix, the bead being prayed lit and lifted.
It is bundled, with the parts of three.js it uses, into `assets/vendor/rosary3d.js`, which is
committed: the site's build and deploy need no Node packages for it.

After changing `strand.js`, rebuild from this folder:

    npm install
    npm run build

`assets/script.js` (initRosaryTracker) loads the bundle only on screens 900px and wider that
have WebGL; without it a row of dots stands in for the beads.
