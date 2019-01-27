[cmdletbinding()]
param (
    [parameter()]
    [switch]$Package
)

npm run compile
Copy-Item .\src\wordlists .\out\ -Recurse -Force

if ($Package) {
    vsce package
}