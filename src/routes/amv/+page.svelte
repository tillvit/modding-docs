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

	let value = `module 'common_aliases'
module 'modcore'
module 'utils'
module 'comboview'

setEditor(false)
-- if SCREENMAN:GetTopScreen() and SCREENMAN:GetTopScreen().GetEditState ~= nil then setEditor(true) end
setBeatOffset(0)

on('on', function()
    hideObjects()
    toggleModsListVisible(true)
end)

mod({0, 0, {
    {0, 0, 'Tiny', 'outQuad'}, 
    {0, scx+400, 'x', 'outQuad'}, 
    {0, 200, 'bumpy', 'outQuad'}, 
    {0, 200, 'bumpyx', 'outQuad'}, 
    {0, 100, 'bumpyy', 'outQuad'}, 
    {0, 300, 'bumpyperiod', 'outQuad'}, 
    {0, 300, 'bumpyxperiod', 'outQuad'}, 
    {0, 300, 'bumpyyperiod', 'outQuad'}, 
    {0, 000, 'bumpyoffset', 'outQuad'}, 
    {0, 100, 'bumpyxoffset', 'outQuad'}, 
    {0, 200, 'bumpyyoffset', 'outQuad'}, 
    {0, 400, 'attenuatez', 'outQuad'}, 
    {0, 400, 'attenuatex', 'outQuad'},  
    {0, scy, 'y', 'outQuad'},
    {0, 200, 'XMod', 'outQuad'},
    {0, 100, 'zbuffer', 'outQuad'},
}})
mod{1,0,{
    {90, 000+13000, 'bumpyoffset', 'linear'}, 
    {90, 100+13000, 'bumpyxoffset', 'linear'}, 
    {90, 200+13000, 'bumpyyoffset', 'linear'}, 
}}

-- for i=0,64 do
--     mod {i+0.5, 0, {
--         {1,((i-1)%2)*100,'Flip','inoutexpo'},
--         {1,((i-1)%2)*50,'Stealth','inoutexpo'}
--     }} 
-- end

local quants = {"4","8","12","16","24","32","48","64"}
local arrow = {}
local judg = {}

function getArrowData(ps, yOffset, column)
    local rt = {}
    rt.x = ArrowEffects.GetXPos(ps, column, yOffset) * sh / 480 + sw / 2
    rt.y = ArrowEffects.GetYPos(ps, column, yOffset) * sh / 480 + sh / 2
    rt.z = ArrowEffects.GetZPos(ps, column, yOffset)
    rt.rotz = ArrowEffects.GetRotationZ(ps, beat, false, column, yOffset)
    return rt
end

function getquant(s)
    for i, v in ipairs{1,1/2,1/3,1/4,1/6,1/8,1/12,1/16} do 
        if math.abs(s-math.round(s/v)*v) < 0.01 then
            return i
        end
    end
    return 8
end

local rots = {90,0,180,-90}
local a = Def.ActorFrame{
    JudgmentMessageCommand= function(self, params)
        if judg[params.TapNoteScore] then
            judg[params.TapNoteScore]:queuecommand("Play")
        end
    end,
    OnCommand=function(self) 
        local ps = GAMESTATE:GetPlayerState("PlayerNumber_P1")
        local notedata = P1:GetNoteData()
        local firstnote = 1
        local lastnote = 1
        local period = 8
        self:SetDrawFunction(function() 
            local shift = Tweens.easeInOutSine(beat%period,0,1,period)
            if math.floor(beat/period) % 2 == 0 then
                shift = Tweens.easeInOutSine(beat%period,1,-1,period)
            end
            local st = poptions[1]:Stealth()
            local stm = 1
            if st > 0.5 then stm = 1-(st-0.5)*2 end
            local da = {}
            local sc = -2 * shift + 1
            for i=firstnote,lastnote do
                local d = notedata[i]
                local ya = ArrowEffects.GetYOffset(ps, d[2], beat)    
                local yb = ArrowEffects.GetYOffset(ps, d[2], d[1])    
                table.insert(da,{ya-yb*shift,yb*(1-shift), d})
            end
            for i,v in ipairs(da) do
                local ad = getArrowData(ps,v[1],v[3][2])
                local arrowy = ArrowEffects.GetYPos(ps, v[3][2], v[2])
                ad.rotz = ArrowEffects.GetRotationZ(ps, (v[3][1] - beat)*shift+beat, false, v[3][2], v[1])
                recep:x(ad.x):y(ad.y+shift*432):z(ad.z):rotationz(ad.rotz+rots[v[3][2]]):zoom(1/2*1.5):Draw()
            end
            for i,v in ipairs(da) do
                local ad = getArrowData(ps,v[2],v[3][2])
                local recepy = ArrowEffects.GetYPos(ps, v[3][2], v[1])
                ad.rotz = ArrowEffects.GetRotationZ(ps, (beat-v[3][1])*shift+v[3][1], false, v[3][2], v[2])
                arrow[getquant(v[3][1])]:x(ad.x):y(ad.y*(1-shift)+shift*(224+scy)):z(ad.z):rotationz(ad.rotz+rots[v[3][2]]):glow(1,1,1,st*2*stm):diffusealpha(1-(st-0.5)*2):Draw()
            end
            for i,v in ipairs(da) do
                local ad = getArrowData(ps,v[1],v[3][2])
                local arrowy = ArrowEffects.GetYPos(ps, v[3][2], v[2])
                ad.rotz = ArrowEffects.GetRotationZ(ps, (v[3][1] - beat)*shift+beat, false, v[3][2], v[1])
                for i=1,5 do
                    judg['TapNoteScore_W'..i]:GetParent():x(ad.x):y(ad.y+shift*432):z(ad.z):rotationz(ad.rotz+rots[v[3][2]]):diffusealpha(math.pow(shift,0.2)):Draw()
                end
            end
            while notedata[firstnote][1] < beat do
                firstnote = firstnote + 1
            end
            while notedata[lastnote][1] < beat+8 do
                lastnote = lastnote + 1
            end
            
        end)
    end,
    Def.Sprite {
        Texture="arrows-scalable/receptor.png",
        OnCommand=function(self)
            recep = self
            self:effectclock("beat"):diffuseramp():effectcolor1(0.1,0.1,0.1,1):effectcolor2(1,1,1,1):effectperiod(0.5):effecttiming(0.25,0.50,0,0.25):effectoffset(-0.25)
        end
    }
}

for i, v in ipairs(quants) do
    a[#a+1] = Def.ActorFrame{
        Def.Model{
            Name= "actor_bjb",
            Bones= "arrows-scalable/".. v .."th/" .. v .. "arrowmesh.txt",
            Materials= "arrows-scalable/"..v.."th/"..v.."th.txt",
            Meshes= "arrows-scalable/".. v .."th/" .. v .. "arrowmesh.txt",
            OnCommand=function(self)
                self:visible(true):zoom(sh/480)
                arrow[i] = self
            end,
        }
    }   
end

for i=1,5 do
    a[#a+1] = Def.ActorFrame{
            Def.Sprite{
            Texture="arrows-scalable/w"..i..".png",
            OnCommand=function(self)
                self:visible(true):zoom(sh/480):diffusealpha(0)
                judg['TapNoteScore_W'..i] = self
            end,
            PlayCommand=function(self)
                self:finishtweening():diffusealpha(1.2):zoom(1.1*sh/480):accelerate(0.15):zoom(1.0*sh/480):diffusealpha(0)
            end,
        }
    }
end

add(a)

action{0, function() P1:visible(false) P2:visible(false) end}

`;
	// `return Def.ActorMultiVertex {
	//     OnCommand=function(self)
	//       &
	//       -- Tell the AMV how to connect the dots.
	//       -- We'll go over this later.
	//       self:SetDrawState{ Mode="DrawMode_Triangles" }

	//       -- Position the vertices.
	//       -- Vertex format: { pos, color, texcoords }
	//       -- pos: 3d coords of the vertex
	//       -- color: the color of the vertex
	//       -- texcoords (optional): the 2d coords on the texture
	//       local vertices = {
	//         {{0, 0, 0}, {1, 1, 1, 1}}, -- vertex #1 at (0, 0)
	//         {{0, 50, 0}, {1, 1, 1, 1}},  -- vertex #2 at (0, 50)
	//         {{50, 0, 0}, {1, 1, 1, 1}}  -- vertex #3 at (50, 0)
	//       }

	//       self:SetVertices(vertices)
	//     end
	// }`;
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
