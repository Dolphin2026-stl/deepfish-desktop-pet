Option Explicit

Dim shell, fileSystem, projectDirectory, electronPath, command
Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")

projectDirectory = fileSystem.GetParentFolderName(WScript.ScriptFullName)
electronPath = fileSystem.BuildPath(projectDirectory, "node_modules\electron\dist\electron.exe")

If Not fileSystem.FileExists(electronPath) Then
  MsgBox "DeepFish Pet dependencies are not installed." & vbCrLf & _
    "Run npm install once, then double-click this file again.", _
    vbExclamation, "DeepFish Pet"
  WScript.Quit 1
End If

shell.CurrentDirectory = projectDirectory
command = Chr(34) & electronPath & Chr(34) & " " & Chr(34) & projectDirectory & Chr(34)
If WScript.Arguments.Named.Exists("dry-run") Then
  WScript.Echo command
  WScript.Quit 0
End If

shell.Run command, 1, False
