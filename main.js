globalThis.MonoGameWebHostConfiguration = {
    runtimeScriptUri: "./_framework/dotnet.js",
    hostExportsTypeName: "TestWebMobileInputValidation.HostExports",
    mainAssemblyName: "TestWebMobileInputValidation.dll",
    canvasResizePolicy: "Adaptive",
    accelerometerPermissionDiagnosticElementId: "accelerometer-permission-diagnostic",
    accelerometerPermissionFromCanvas: true
};

await import("./monogame-web-host.js");
