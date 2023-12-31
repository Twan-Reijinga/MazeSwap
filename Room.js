class Room {
    constructor(room, tileSize, tileMaps) {
        this.tileSize = tileSize;

        this.tiles = tileMaps[0];
        this.leverTex = tileMaps[1];
        this.arrow = tileMaps[2];

        this.map = room.map;
        this.bridges = room.bridges;
        this.lever = room.switch;
        this.escape = room.escape;
        this.barriers = room.barriers;

        this.map[this.escape[1]][this.escape[0]] = true;
    }

    interact(player) {
        let x = player.pos.x;
        let y = player.pos.y;
        let isHunter = player.isHunter;

        let arr = [];

        let tileX = Math.floor(x / this.tileSize);
        let tileY = Math.floor(y / this.tileSize);
        for (x = -1; x < 2; x++) {
            for (y = -1; y < 2; y++) {
                for (let i = 0; i < this.bridges.length; i++) {
                    if (
                        this.bridges[i][0] == tileX + x &&
                        this.bridges[i][1] == tileY + y &&
                        (x != 0 || y != 0)
                    ) {
                        arr.push(createVector(tileX + x, tileY + y));
                    }
                }
                if (
                    this.lever[0] == tileX &&
                    this.lever[1] == tileY &&
                    !isHunter
                ) {
                    if (!this.lever[2]) {
                        let doorsound = Math.floor(
                            Math.random() * doorSounds.length
                        );
                        doorSounds[doorsound].play();
                        doorSounds[doorsound].setVolume(0.125);
                    }

                    this.lever[2] = true;
                    this.map[this.escape[1]][this.escape[0]] = false;
                }
            }
        }

        if (arr.length > 0) {
            let smallest = Infinity;
            let index = 0;
            let pPos = player.getCenterPos();
            console.log(arr);
            console.log(pPos);
            for (let i = 0; i < arr.length; i++) {
                let bridgepos = createVector(
                    arr[i].x * 50 + 25,
                    arr[i].y * 50 + 25
                );
                console.log(arr[i].x);
                let dist = sqrt(
                    (pPos.x - bridgepos.x) ** 2 + (pPos.y - bridgepos.y) ** 2
                );

                if (dist < smallest) {
                    smallest = dist;
                    index = i;
                }
            }
            // console.log(index);
            if (this.map[arr[index].y][arr[index].x] != isHunter) {
                let doorsound = Math.floor(Math.random() * doorSounds.length);
                doorSounds[doorsound].play();
                doorSounds[doorsound].setVolume(0.125);

                this.map[arr[index].y][arr[index].x] = isHunter;
            }
        }
    }

    getTileFloor(x, y, isHunter) {
        if (
            x < 0 ||
            y < 0 ||
            x >= this.map.length * this.tileSize ||
            y >= this.map.length * this.tileSize //checkt of x of y buiten de map komt (al die andere onhandigheid is nu onnodig)
        ) {
            return -1;
        }

        let tileX = Math.floor(x / this.tileSize);
        let tileY = Math.floor(y / this.tileSize);
        let val = false;
        for (let i = 0; i < this.barriers.length; i++) {
            if (tileX == this.barriers[i][0] && tileY == this.barriers[i][1]) {
                return !isHunter;
            }
        }

        return this.map[tileY][tileX];
    }

    detectWin(player) {
        let tileX = Math.floor(player.pos.x / this.tileSize);
        let tileY = Math.floor(player.pos.y / this.tileSize);
        if (tileX == this.escape[0] && tileY == this.escape[1]) {
            winner = player;
        }
    }

    isSpecial(x, y) {
        if (x == this.escape[0] && y == this.escape[1] && this.lever[2] == true)
            return true;
        for (let i = 0; i < this.barriers.length; i++) {
            if (this.barriers[i][0] == x && this.barriers[i][1] == y) {
                return true;
            }
        }
        return false;
    }

    isBridge(x, y) {
        for (let i = 0; i < this.bridges.length; i++) {
            if (this.bridges[i][0] == x && this.bridges[i][1] == y) {
                return true;
            }
        }
        return false;
    }

    getRequiredTile(x, y, map) {
        let val = 0;
        let left = false;
        let top = false;
        let corner = false;

        if (x == 0 || map[y][x] != map[y][x - 1]) left = true;
        if (y == 0 || map[y][x] != map[y - 1][x]) top = true;
        if (left || top || map[y][x] != map[y - 1][x - 1]) corner = true;

        if (corner && !left && !top) {
            val = 0;
        } else if (left && top) {
            val = 1;
        } else if (!left && top) {
            val = 2;
        } else if (left && !top) {
            val = 3;
        } else {
            val = 4;
        }
        val =
            val +
            5 * (map[y][x] == 1) +
            10 * this.isBridge(x, y) +
            20 * this.isSpecial(x, y);
        return val;
    }

    deactivateSwitch() {
        this.lever[2] = false;
        this.map[this.escape[1]][this.escape[0]] = true;
    }

    draw(offset) {
        noSmooth();
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[0].length; x++) {
                let img = this.tiles[this.getRequiredTile(x, y, this.map)];
                image(
                    img,
                    x * this.tileSize + offset.x,
                    y * this.tileSize + offset.y,
                    this.tileSize,
                    this.tileSize
                );
                if (
                    this.escape[0] == x &&
                    this.escape[1] == y &&
                    this.lever[2] == true
                ) {
                    if (x == 0) {
                        image(
                            this.arrow[1],
                            x * this.tileSize + offset.x,
                            y * this.tileSize + offset.y,
                            this.tileSize,
                            this.tileSize
                        );
                    } else if (y == 0) {
                        image(
                            this.arrow[0],
                            x * this.tileSize + offset.x,
                            y * this.tileSize + offset.y,
                            this.tileSize,
                            this.tileSize
                        );
                    } else if (x == this.map.length - 1) {
                        image(
                            this.arrow[2],
                            x * this.tileSize + offset.x,
                            y * this.tileSize + offset.y,
                            this.tileSize,
                            this.tileSize
                        );
                    } else if (y == this.map.length - 1) {
                        image(
                            this.arrow[3],
                            x * this.tileSize + offset.x,
                            y * this.tileSize + offset.y,
                            this.tileSize,
                            this.tileSize
                        );
                    }
                }
                if (this.lever[0] == x && this.lever[1] == y) {
                    let imglever =
                        this.leverTex[this.lever[3] + 4 * this.lever[2]];

                    image(
                        imglever,
                        x * this.tileSize + offset.x,
                        y * this.tileSize + offset.y,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }
    }
}
