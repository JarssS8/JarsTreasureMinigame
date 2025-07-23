

JTM = JTM or {}
JTM.Config = {
    Debug = false, -- Enable/disable debug messages
    HintMode = "number", -- Options: "number", "icons" or "none"
    VisualMode = "color", -- Options: "color" or "nocolor"
    GridSize = 5, -- Size of the grid for the minigame
    Attempts = 8, -- Number of attempts allowed in the minigame
    Time = 10, -- Time in seconds for the minigame
    CheckVersion = true, -- Enable/disable automatic checking
    GitHubRepo = "JarssS8/JarsTreasureMinigame" -- GitHub repository for version checking
}

JTM.Shared = {
    Config = JTM.Config,
    ResourceName = GetCurrentResourceName(),
    DebugPrint = function(message)
        if JTM.Config.Debug then
            print("^3[DEBUG] " .. message .. "^7")
        end
    end,
    Notify = function(text, type)
        if exports and exports['qb-core'] then
            JTM.Shared.DebugPrint("^2[CLIENT] Sending notification: " .. text .. "^7")
            if type == "success" then
                exports['qb-core']:Notify(text, 'success')
            elseif type == "error" then
                exports['qb-core']:Notify(text, 'error')
            else
                exports['qb-core']:Notify(text, 'primary')
            end
        elseif exports and exports['esx_notify'] then
            JTM.Shared.DebugPrint("^2[CLIENT] Sending ESX notification: " .. text .. "^7")
            if type == "success" then
                exports['esx_notify']:SendNotification({text = text, type = 'success'})
            elseif type == "error" then
                exports['esx_notify']:SendNotification({text = text, type = 'error'})
            else
                exports['esx_notify']:SendNotification({text = text, type = 'info'})
            end
        elseif exports and exports['mythic_notify'] then
            JTM.Shared.DebugPrint("^2[CLIENT] Sending Mythic notification: " .. text .. "^7")
            if type == "success" then
                exports['mythic_notify']:SendAlert('success', text)
            elseif type == "error" then
                exports['mythic_notify']:SendAlert('error', text)
            else
                exports['mythic_notify']:SendAlert('inform', text)
            end
        else
            print("^1[ERROR] Notification system not available..^7")
        end
    end,
    
    -- Version Check Functions (Server-side only)
    CheckVersion = function()
        if not JTM.Config.CheckVersion then
            return
        end
        
        local currentVersion = GetResourceMetadata(GetCurrentResourceName(), 'version', 0)
        if not currentVersion then
            JTM.Shared.DebugPrint("^1[VERSION] Could not get current version from fxmanifest.lua^7")
            return
        end
        
        local repoUrl = "https://raw.githubusercontent.com/" .. JTM.Config.GitHubRepo .. "/main/fxmanifest.lua"
        
        JTM.Shared.DebugPrint("^5[VERSION] Checking for updates from: " .. repoUrl .. "^7")
        
        PerformHttpRequest(repoUrl, function(statusCode, response, headers)
            if statusCode == 200 and response then
                local latestVersion = string.match(response, "version%s+['\"]([^'\"]+)['\"]")
                
                if latestVersion then
                    JTM.Shared.DebugPrint("^5[VERSION] Current: " .. currentVersion .. " | Latest: " .. latestVersion .. "^7")
                    
                    if not JTM.Shared.CompareVersions(currentVersion, latestVersion) then
                        -- Only show warning if outdated
                        print("^1===============================================^7")
                        print("^1[JARS-MINIGAMES] ⚠️  UPDATE AVAILABLE!^7")
                        print("^1[JARS-MINIGAMES] Current: " .. currentVersion .. " | Latest: " .. latestVersion .. "^7")
                        print("^1[JARS-MINIGAMES] Download: https://github.com/" .. JTM.Config.GitHubRepo .. "^7")
                        print("^1===============================================^7")
                    end
                else
                    JTM.Shared.DebugPrint("^1[VERSION] Could not parse version from response^7")
                end
            else
                JTM.Shared.DebugPrint("^1[VERSION] Failed to check version. Status: " .. (statusCode or "unknown") .. "^7")
            end
        end, "GET")
    end,
    
    CompareVersions = function(current, latest)
        local function parseVersion(v)
            local parts = {}
            for part in string.gmatch(v, "(%d+)") do
                table.insert(parts, tonumber(part))
            end
            return parts
        end
        
        local currentParts = parseVersion(current)
        local latestParts = parseVersion(latest)
        
        for i = 1, math.max(#currentParts, #latestParts) do
            local curr = currentParts[i] or 0
            local lat = latestParts[i] or 0
            
            if curr < lat then
                return false 
            elseif curr > lat then
                return true
            end
        end
        
        return true
    end
}