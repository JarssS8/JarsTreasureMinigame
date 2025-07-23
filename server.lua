-- Check for updates when resource starts (server-side only)
Citizen.CreateThread(function()
    Citizen.Wait(5000)
    if JTM.Config.CheckVersion then
        JTM.Shared.CheckVersion()
    end
end)

RegisterNetEvent('treasure:gameResult')
AddEventHandler('treasure:gameResult', function(hasWon)
    local src = source
    local playerName = GetPlayerName(src)
    local result = hasWon and "WON" or "LOST"
    
    -- You can add additional logic here like rewards, notifications, etc.
    if hasWon then
        JTM.Shared.DebugPrint(string.format("^2[SUCCESS] Player %s won the treasure minigame!^7", playerName))
    else
        JTM.Shared.DebugPrint(string.format("^1[ERROR] Player %s lost the treasure minigame.^7", playerName))
    end
end)

