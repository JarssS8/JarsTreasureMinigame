local isMinigameActive = false
JTM = JTM or {}

function JTM.CloseMinigame()
    JTM.Shared.DebugPrint("^3[CLIENT] Closing minigame UI.^7")
    isMinigameActive = false
    SetNuiFocus(false, false)
    SendNuiMessage(json.encode({ type = "hideUI" }))
end


-- Register a command to start the treasure minigame
-- Example usage: /treasure-minigame number color 5 8 10
-- Hints: /treasure-minigame <hintMode> <visualMode> <gridSize> <attempts> <time>
-- hintMode: "number", "icons" or "none"
-- visualMode: "color" or "nocolor"
RegisterCommand('treasure-minigame', function(source, args, rawCommand)
    if not JTM.Config.Debug then
        JTM.Shared.DebugPrint("^1[CLIENT] Debug mode is disabled. Command will not execute.^7")
        return
    end
    isMinigameActive = true
    local hintMode = args[1] or JTM.Config.HintMode
    local visualMode = args[2] or JTM.Config.VisualMode
    local gridSize = tonumber(args[3]) or JTM.Config.GridSize
    local attempts = tonumber(args[4]) or JTM.Config.Attempts
    local time = tonumber(args[5]) or JTM.Config.Time
    
    JTM.StartTreasureMinigame(hintMode, visualMode, gridSize, attempts, time)
end, false)

function JTM.StartTreasureMinigame(hintMode, visualMode, gridSize, attempts, time)
    if not isMinigameActive then
        local resourceName = JTM.Shared.ResourceName
        isMinigameActive = true
        JTM.Shared.DebugPrint( resourceName .. " - ^2[CLIENT] Starting treasure minigame with parameters: hintMode=" .. hintMode .. ", visualMode=" .. visualMode .. ", gridSize=" .. gridSize .. ", attempts=" .. attempts .. ", time=" .. time .. "^7")

        SendNuiMessage(json.encode({
            type = "startGame",
            hintMode = hintMode,
            visualMode = visualMode,
            gridSize = gridSize,
            totalAttempts = attempts,
            maxTime = time,
            resourceName = resourceName,
            debug = JTM.Config.Debug
        }))
        SetNuiFocus(true, true)
    else
        JTM.Shared.DebugPrint("^1[CLIENT] Minigame is already active. Cannot start a new one.^7")
    end
end

RegisterNuiCallback('gameResult', function(data, cb)
    JTM.Shared.DebugPrint("^2[CLIENT] NUI callback gameResult received with data: " .. json.encode(data) .. "^7")
    
    if data.win ~= nil then
        JTM.Shared.DebugPrint("^2[CLIENT] Sending server event: treasure:gameResult with win=" .. tostring(data.win) .. "^7")
        if not data.win then
            JTM.Shared.Notify('You lost the treasure minigame!', 'error')
        else
            JTM.Shared.Notify('You won the treasure minigame!', 'success')
        end
        TriggerServerEvent('treasure:gameResult', data.win)
        
        JTM.CloseMinigame()
    else
        JTM.Shared.DebugPrint("^1[CLIENT] Error: gameResult callback received invalid data (win is nil)^7")
    end
    
    cb('ok')
end)

RegisterNuiCallback('closeUI', function(data, cb)
    JTM.Shared.DebugPrint("^3[CLIENT] NUI callback closeUI received^7")
    JTM.CloseMinigame()
    TriggerServerEvent('treasure:gameResult', false)
    cb('ok')
end)

