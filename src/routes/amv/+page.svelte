<script>
	import InteractiveEditor from '$lib/InteractiveEditor.svelte';
	import * as PIXI from 'pixi.js';
	import { onMount } from 'svelte';

	/**
	 * @type {HTMLCanvasElement}
	 */
	let basicTriangleView;
	let app;
	onMount(() => {
		app = new PIXI.Application({
			view: basicTriangleView,
			width: 400,
			height: 500
		});
	});

	let value = `return Def.ActorMultiVertex {
  OnCommand=function(self)
    -- Tell the AMV how to connect the dots.
    -- We'll go over this later.
    self:SetDrawState{ Mode="DrawMode_Triangles" }

    -- Position the vertices.
    -- Vertex format: { pos, color, texcoords }
    -- pos: 3d coords of the vertex
    -- color: the color of the vertex
    -- texcoords (optional): the 2d coords on the texture
    local vertices = {
      {{0, 0, 0}, {1, 1, 1, 1}}, -- vertex #1 at (0, 0)
      {{0, 50, 0}, {1, 1, 1, 1}},  -- vertex #2 at (0, 50)
      {{50, 0, 0}, {1, 1, 1, 1}}  -- vertex #3 at (50, 0)
    }

    self:SetVertices(vertices)
  end
}`;
</script>

<InteractiveEditor bind:value />
<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
<h1>Understanding ActorMultiVertexes</h1>
<p>ActorMultiVertexes (AMVs) can be used to create complex shapes by providing a set of points.</p>
<h3>Basics</h3>
<p>
	AMVs work quite similar to a connect-the-dots puzzle. Each dot (called a vertex) has its own
	position on the screen, as well as a color and texture coordinates (We'll get to these two later).
	By positioning connecting these vertices in a certain way, we can create complex shapes.
</p>
<p>Here's a basic example of a triangle using an AMV:</p>

<div class="interactive-container">
	<canvas bind:this={basicTriangleView} />
</div>

<h3>DrawModes</h3>
<p>
	Unlike a connect-the-dots puzzle, AMVs don't have to necessarily connect the dots with one long
	line. We can
</p>
