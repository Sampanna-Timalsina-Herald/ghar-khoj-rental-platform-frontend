@echo off
setlocal enabledelayedexpansion

set "BASEDIR=c:\Users\sampa\OneDrive\Desktop\KHOJGHAR\frontend\src\pages"

REM Delete old About.jsx
if exist "!BASEDIR!\About.jsx" (
    del "!BASEDIR!\About.jsx"
    echo ✓ Deleted About.jsx
) else (
    echo ! About.jsx not found
)

REM Rename About_new.jsx to About.jsx
if exist "!BASEDIR!\About_new.jsx" (
    ren "!BASEDIR!\About_new.jsx" "About.jsx"
    echo ✓ Renamed About_new.jsx to About.jsx
) else (
    echo ! About_new.jsx not found
)

REM Delete old ListProperty.jsx
if exist "!BASEDIR!\ListProperty.jsx" (
    del "!BASEDIR!\ListProperty.jsx"
    echo ✓ Deleted ListProperty.jsx
) else (
    echo ! ListProperty.jsx not found
)

REM Rename ListProperty_new.jsx to ListProperty.jsx
if exist "!BASEDIR!\ListProperty_new.jsx" (
    ren "!BASEDIR!\ListProperty_new.jsx" "ListProperty.jsx"
    echo ✓ Renamed ListProperty_new.jsx to ListProperty.jsx
) else (
    echo ! ListProperty_new.jsx not found
)

echo.
echo ✓ All file operations completed successfully!
