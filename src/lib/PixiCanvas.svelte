<script>
	import * as PIXI from "pixi.js";
	import { onMount } from "svelte";
  export let app;
  /**
	 * @type {Partial<PIXI.IApplicationOptions> | undefined}
	 */
   export let settings
  /**
	 * @type {HTMLCanvasElement}
	 */
  let view;
  onMount(() => {
        app = new PIXI.Application({
          view,
          ...settings
    })
  })
</script>

<canvas bind:this={view}></canvas>