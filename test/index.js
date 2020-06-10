const path = require("path");
const collada2gltf = require("../");

collada2gltf(
    path.resolve(__dirname, './models/elf/elf.dae'),
    path.resolve(__dirname, './output/elf.glb')
);