--A helper function that prints an actor, but won't go deeper than surface level.
local ActorToText = function(act, header)--Most of the logic was taken from Arctic's DevConsole.
	local str = string.gmatch(tostring(act), "[^%s]+")()
	if act.GetName and not act.GetCardState then
		str = str.."["..act:GetName().."]"
		if act.GetNumChildren then
			local num = act:GetNumChildren()
			str = str .. ": "..(header and '' or (act:GetNumChildren()==1 and num..' child' or num..' children'))
		elseif act.GetTexture and act:GetTexture() then
			str = str .. ": "..act:GetTexture():GetPath()
		elseif act.GetText and act:GetText() then
			str = str .. ": "..act:GetText()
		end
	end
	return str
end
--A specialized wrapper around print(...) to help facilitate actually printing stuff to the lua console.
function printLuaConsole(...)
	local args = table.pack(...)-- Doing {...} can omit the trailing nil.
	local str = ''
	for i=1,args.n do -- I can't do #args because it can omit out the trailing nil.
		local item = args[i]
		if i > 1 then str = str .. '    ' end
		--If the number of arguments is more than 1, we don't want to expand the item, maybe.
		local datatype = type(item)
		if datatype == 'table' and tostring(item):find('table:') and args.n == 1 then
			--Each item gets its' own line.
			str = str .. "{"
			print(str)
			ShowInLuaConsole(str)
			for ind,val in pairs(item) do
				str = '    '..tostring(ind)..' = '..tostring(val)
				print(str)
				ShowInLuaConsole(str)
			end
			str = "}"
		elseif (datatype == 'table' or datatype == 'userdata') and args.n == 1 then
			--Each item gets its' own line.
			str = str .. ActorToText(item, true)
			print(str)
			ShowInLuaConsole(str)
			if item.GetNumChildren then
				print("{")
				ShowInLuaConsole("{")

				local num = item:GetNumChildren()
				for i=1,num do
					str = ' '..i..' = '..ActorToText(item:GetChildAt(i))
					print(str)
					ShowInLuaConsole(str)
				end
				print("}")
				ShowInLuaConsole("}")
			end
			return
		else
			str = str .. tostring(item)
		end
	end
	print(str)
	ShowInLuaConsole(str)
end
