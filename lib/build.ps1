if (!$IsWindows) {
  Write-Host "node addon build skipped on non-win32 environment"
  exit
}

if (!(Get-Command node-gyp -ErrorAction SilentlyContinue)) {
  Write-Host "node-gyp is not installed"
  exit 1
}

# The first argument is the target architecture
foreach ($arch in $args) {
  $dest = "win32-${arch}_lib.node"

  # Remove any files from previous builds
  Remove-Item -Recurse -Force './build' -ErrorAction SilentlyContinue
  Remove-Item -Force $dest -ErrorAction SilentlyContinue

  # Run node-gyp to build the node addon
  & node-gyp --platform=win32 "--arch=${arch}" configure build

  # Move the file to its destination
  Move-Item -Force './build/Release/lib.node' $dest
  # Remove the build folder
  Remove-Item -Recurse -Force './build' -ErrorAction SilentlyContinue
}