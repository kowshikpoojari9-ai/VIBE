import Phaser from 'phaser';

export type WorldEvent = { type: string; name?: string; message?: string };

type Person = {
  name: string; x: number; y: number; color: number; job: string; goal: string;
  dialogue: string[]; sprite: Phaser.GameObjects.Container;
  homeX: number; homeY: number; phase: number;
};

export class World extends Phaser.Scene {
  onEvent: (e: WorldEvent) => void = () => {};
  player!: Phaser.GameObjects.Container;
  keys!: any;
  people: Person[] = [];
  car!: Phaser.GameObjects.Container;
  driving = false;
  speed = 0;
  clock = 0;
  cars: Phaser.GameObjects.Container[] = [];
  prompt!: Phaser.GameObjects.Text;

  constructor() {
    super('World');
  }

  create() {
    const W = 2600, H = 1900;
    this.physics.world.setBounds(24, 24, W - 48, H - 48);
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.setZoom(1.05);

    const g = this.add.graphics();
    g.fillStyle(0x315547).fillRect(0, 0, W, H);

    // Wide roads, sidewalks, lane markings and crossings.
    const vRoads = [410, 1230, 2050], hRoads = [410, 1120, 1690];

    for (const x of vRoads) {
      g.fillStyle(0x798071).fillRect(x - 166, 0, 332, H);
      g.fillStyle(0x343a3c).fillRect(x - 139, 0, 278, H);
      g.fillStyle(0x42484a).fillRect(x - 119, 0, 238, H);
      g.lineStyle(2, 0xe8dcb5, .48);
      g.lineBetween(x - 95, 0, x - 95, H);
      g.lineBetween(x + 95, 0, x + 95, H);
      g.lineStyle(3, 0xd9bc71, .75);

      for (let y = 0; y < H; y += 68) g.lineBetween(x, y, x, y + 35);

      for (const y of hRoads) {
        for (let k = -5; k <= 5; k++)
          g.fillStyle(0xf0e7cc, .8).fillRect(x + k * 22 - 8, y - 135, 14, 70);
        g.fillStyle(0xe6b467).fillCircle(x - 144, y - 144, 8);
        g.fillStyle(0x56c8a5).fillCircle(x + 144, y - 144, 8);
      }
    }

    for (const y of hRoads) {
      g.fillStyle(0x798071).fillRect(0, y - 150, W, 300);
      g.fillStyle(0x343a3c).fillRect(0, y - 124, W, 248);
      g.fillStyle(0x42484a).fillRect(0, y - 105, W, 210);
      g.lineStyle(2, 0xe8dcb5, .48);
      g.lineBetween(0, y - 82, W, y - 82);
      g.lineBetween(0, y + 82, W, y + 82);
      g.lineStyle(3, 0xd9bc71, .75);
      for (let x = 0; x < W; x += 68) g.lineBetween(x, y, x + 35, y);

      for (const x of vRoads) {
        for (let k = -5; k <= 5; k++)
          g.fillStyle(0xf0e7cc, .8).fillRect(x - 135, y + k * 22 - 8, 70, 14);
      }
    }

    // Neighbourhood park.
    g.fillStyle(0x607f59).fillRoundedRect(1290, 1175, 640, 410, 26);
    g.lineStyle(15, 0xbcae84, .8);
    g.strokeRoundedRect(1330, 1215, 560, 330, 35);
    g.lineStyle(2, 0xdfcc9e, .9);
    g.lineBetween(1610, 1225, 1610, 1540);
    g.strokeCircle(1610, 1380, 65);
    g.fillStyle(0x927650).fillRoundedRect(1458, 1370, 90, 25, 5);
    g.fillStyle(0x927650).fillRoundedRect(1680, 1260, 90, 25, 5);

    // Shops, homes and civic buildings.
    const blocks = [
      [55, 55, 250, 260, '#c56e4e', 'NANDI TEA & TIFFIN'],
      [485, 52, 260, 270, '#738a6d', 'KAVERI ROOMS'],
      [815, 65, 300, 235, '#d09a57', 'SRI LAKSHMI STORES'],
      [1365, 60, 250, 290, '#c6835a', 'AUTO WORKS'],
      [1705, 55, 260, 270, '#718aa0', 'CITY CLINIC'],
      [2150, 75, 330, 260, '#ce8a58', 'BUS DEPOT'],
      [65, 555, 260, 265, '#997caa', 'VANI BOOKS'],
      [480, 555, 270, 300, '#b86e58', 'CHAI POINT'],
      [820, 550, 300, 270, '#859974', 'COMMUNITY HALL'],
      [1370, 570, 270, 260, '#d19f5f', 'FLOWER MARKET'],
      [1710, 555, 290, 290, '#9a7059', 'REPAIR & SPARES'],
      [2160, 565, 300, 260, '#71889a', 'POLICE OUTPOST'],
      [55, 1270, 280, 310, '#bd8555', 'SAVITRI BAKERY'],
      [490, 1290, 300, 270, '#768b67', 'CINEMA'],
      [845, 1290, 270, 300, '#a97585', 'TAILORING'],
      [2155, 1265, 300, 310, '#b48a55', 'FRESH MART'],
      [65, 1735, 280, 135, '#8d7460', 'LOCAL BUS STAND'],
      [500, 1740, 260, 130, '#aa7855', 'FLOWER STALL'],
      [850, 1740, 260, 130, '#776e93', 'MURAL LANE']
    ] as const;

    for (const [x, y, w, h, col, label] of blocks)
      this.paintBuilding(g, x, y, w, h, col, label);

    // Roadside market stalls and greenery.
    for (const [x, y] of [
      [355, 340], [765, 360], [1160, 540], [1645, 345], [1980, 520],
      [350, 1045], [780, 1060], [1170, 1450], [1980, 1540], [350, 1625],
      [1140, 880], [2100, 1035], [1240, 1710], [2030, 1740]
    ] as number[][]) this.addStall(g, x, y);

    for (let i = 0; i < 86; i++) {
      const x = 35 + (i * 197) % 2520, y = 30 + (i * 317) % 1820;
      if (this.nearRoad(x, y, vRoads, hRoads) || this.inRect(x, y, 1290, 1175, 640, 410)) continue;
      this.addTree(g, x, y, i);
    }

    this.add.text(28, 24, 'KAVERI NAGAR  /  SOUTH BENGALURU', {
      fontFamily: 'Arial', fontSize: '12px', fontStyle: 'bold', color: '#f2d58d',
      backgroundColor: '#13211dd9', padding: { x: 10, y: 7 }
    }).setDepth(200).setScrollFactor(0);

    this.add.text(28, 62, 'A CITY BLOCK IS A WORLD', {
      fontFamily: 'Arial', fontSize: '9px', letterSpacing: 2, color: '#c2d0c6',
      backgroundColor: '#13211dcc', padding: { x: 10, y: 6 }
    }).setDepth(200).setScrollFactor(0);

    // NPCs with different jobs, ambitions and dialogue.
    const peopleData = [
      ['Meera', 375, 470, 0xf2b15f, 'tea stall owner', 'Keep her late-night stall afloat',
        ['The blue scooter? Ask Ravi before you touch it.', 'I keep the tea hot and the gossip hotter.']],
      ['Ravi', 900, 360, 0xef8265, 'delivery rider', 'Save for a mechanic course',
        ['I have one parcel for Dev. Easy pay, short ride.', 'Take the scooter if you need it. Bring it back in one piece.']],
      ['Asha', 1120, 1045, 0xb2a0e7, 'mural artist', 'Paint a wall without losing her space',
        ['The mural lane changes every week. Go see what is new.', 'A map can be a memory. Start where the paint is fresh.']],
      ['Imran', 1500, 1080, 0x7dbfe1, 'food courier', 'Get his sister home before dark',
        ['Market Road is blocked again. I could use another pair of hands.', 'People leave clues in the places they hurry past.']],
      ['Dev', 1900, 1040, 0x8acb81, 'repair shop owner', 'Keep his family garage open',
        ['I pay for deliveries. I do not pay for questions.', 'That scooter is fast enough to get you in trouble. Or home.']],
      ['Kavya', 1070, 465, 0xf08aa2, 'student musician', 'Find an open mic stage',
        ['There is an open mic near the cinema tonight. You should come.', 'I am saving for a guitar amp. The little one, not the dream one.']],
      ['Salim', 770, 1160, 0xe5ce75, 'bus conductor', 'Get a lost bag back to its owner',
        ['Found a schoolbag on the number twelve. I cannot leave my route.', 'Ask around the stand. Someone must be looking for it.']]
    ] as const;

    for (const [name, x, y, color, job, goal, dialogue] of peopleData)
      this.makePerson(name, x, y, color, job, goal, [...dialogue]);

    // Parked rides and moving traffic.
    this.car = this.makeVehicle(1470, 430, 0xf0aa47, false, 'SCOOTER');
    this.makeVehicle(1090, 670, 0xe5bf62, false, 'AUTO');
    this.makeVehicle(790, 930, 0x53a6bd, true, 'BUS');

    for (let i = 0; i < 5; i++)
      this.cars.push(this.makeVehicle(
        120 + i * 425, 390 + (i % 2) * 42,
        [0xc3584b, 0x4e91a8, 0xd4d0bc, 0x7eae74, 0xe6a447][i],
        false, 'TRAFFIC'
      ));

    // Player character.
    this.player = this.makePersonSprite(790, 700, 0x48d7b0, 'YOU');
    this.player.setDepth(30);
    this.physics.add.existing(this.player);
    const pb = this.player.body as Phaser.Physics.Arcade.Body;
    pb.setCollideWorldBounds(true);
    pb.setSize(20, 20).setOffset(4, 8);

    this.prompt = this.add.text(0, 0, '', {
      fontFamily: 'Arial', fontSize: '11px', fontStyle: 'bold',
      color: '#f8e8b4', backgroundColor: '#101918e8',
      padding: { x: 10, y: 8 }, align: 'center'
    }).setDepth(220).setScrollFactor(0).setOrigin(.5, 1);

    this.add.text(28, 600, 'WASD MOVE  ·  E TALK / INTERACT  ·  F VEHICLE  ·  SHIFT RUN', {
      fontFamily: 'Arial', fontSize: '9px', color: '#d6dbd4',
      backgroundColor: '#111a', padding: { x: 9, y: 7 }
    }).setScrollFactor(0).setDepth(200);

    this.cameras.main.startFollow(this.player, true, .09, .09);
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,E,SHIFT,UP,DOWN,LEFT,RIGHT,ESC,SPACE,F');
    this.input.keyboard!.on('keydown-E', () => this.interact());
    this.input.keyboard!.on('keydown-F', () => this.toggleVehicle());
    this.input.keyboard!.on('keydown-ESC', () => this.onEvent({ type: 'pause' }));
    this.events.on('resize', () => {});
  }

  paintBuilding(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, col: string, label: string) {
    g.fillStyle(0x101713, .36).fillRoundedRect(x + 10, y + 17, w, h, 14);
    g.fillStyle(0x6e695c).fillRoundedRect(x - 5, y + h - 8, w + 10, 20, 4);
    const color = Phaser.Display.Color.HexStringToColor(col).color;
    g.fillStyle(0x252e2d).fillRoundedRect(x, y, w, h, 12);
    g.fillStyle(color).fillRoundedRect(x, y, w, h - 17, 12);
    g.fillStyle(0xf3dfb2, .18).fillRect(x + 12, y + 39, w - 24, 4);
    g.fillStyle(0x16272a).fillRoundedRect(x + w * .35, y + h - 59, w * .3, 53, 7);
    g.fillStyle(0xe5c174).fillRect(x + w * .35, y + h - 59, w * .3, 5);

    for (let xx = x + 22; xx < x + w - 18; xx += 43) {
      for (let yy = y + 57; yy < y + h - 72; yy += 47) {
        g.fillStyle(0x213337).fillRoundedRect(xx, yy, 22, 27, 3);
        g.fillStyle(0xf3c66e, ((xx + yy) % 3 === 0) ? .65 : .2).fillRect(xx + 4, yy + 5, 4, 6);
        g.fillStyle(0xf3c66e, ((xx + yy) % 2 === 0) ? .42 : .12).fillRect(xx + 13, yy + 5, 4, 6);
      }
    }

    g.fillStyle(0x171e1f, .88).fillRoundedRect(x + 8, y + 10, w - 16, 23, 5);
    this.add.text(x + w / 2, y + 14, label, {
      fontFamily: 'Arial',
      fontSize: Math.min(11, w / label.length * 1.7) + 'px',
      fontStyle: 'bold', color: '#f5e6c2', align: 'center'
    }).setOrigin(.5, 0).setDepth(8);
  }

  addStall(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0x18221d, .3).fillEllipse(x + 3, y + 20, 68, 28);
    g.fillStyle(0x74563c).fillRoundedRect(x - 28, y - 8, 56, 30, 4);
    g.fillStyle(0xc34d42).fillRect(x - 34, y - 22, 68, 18);
    g.fillStyle(0xe7c178).fillRect(x - 34, y - 22, 68, 5);
    g.fillStyle(0xf0d68b).fillCircle(x - 12, y + 3, 5);
    g.fillStyle(0x83bd80).fillCircle(x + 6, y + 1, 6);
    g.fillStyle(0xe28c59).fillCircle(x + 20, y + 2, 5);
  }

  addTree(g: Phaser.GameObjects.Graphics, x: number, y: number, i: number) {
    const r = 12 + (i % 4) * 2;
    g.fillStyle(0x574537).fillRect(x - 3, y + 3, 6, 12);
    g.fillStyle(i % 3 === 0 ? 0x588453 : 0x3d774b).fillCircle(x, y, r);
    g.fillStyle(0x8daf69, .55).fillCircle(x - r * .35, y - r * .3, r * .48);
    g.fillStyle(0x193d31, .45).fillCircle(x + r * .36, y + r * .22, r * .62);
  }

  nearRoad(x: number, y: number, vs: number[], hs: number[]) {
    return vs.some(a => Math.abs(a - x) < 175) || hs.some(a => Math.abs(a - y) < 165);
  }

  inRect(x: number, y: number, a: number, b: number, w: number, h: number) {
    return x > a && x < a + w && y > b && y < b + h;
  }

  makePersonSprite(x: number, y: number, color: number, label: string) {
    const c = this.add.container(x, y).setDepth(25);
    const shadow = this.add.ellipse(1, 13, 24, 10, 0x08100c, .45);
    const legs = this.add.rectangle(0, 6, 13, 14, 0x29373a);
    const body = this.add.rectangle(0, -4, 19, 17, color).setStrokeStyle(2, 0x16251e);
    const head = this.add.circle(0, -17, 8, 0xc88d69).setStrokeStyle(1, 0x3e2d25);
    const hair = this.add.arc(0, -19, 8, 185, 355, false, 0x26201c).setFillStyle(0x26201c);
    const highlight = this.add.circle(-3, -4, 2, 0xffffff, .45);
    c.add([shadow, legs, body, head, hair, highlight]);
    if (label === 'YOU') c.setData('player', true);
    return c;
  }

  makePerson(name: string, x: number, y: number, color: number, job: string, goal: string, dialogue: string[]) {
    const sprite = this.makePersonSprite(x, y, color, name);
    sprite.setDepth(24);
    const label = this.add.text(x, y + 18, name, {
      fontFamily: 'Arial', fontSize: '10px', fontStyle: 'bold',
      color: '#fff8e5', backgroundColor: '#111b', padding: { x: 4, y: 2 }
    }).setOrigin(.5, 0).setDepth(26);
    this.people.push({ name, x, y, color, job, goal, dialogue, sprite, homeX: x, homeY: y, phase: Math.random() * 7 });
    sprite.setData('personName', name);
    sprite.setData('label', label);
    this.physics.add.existing(sprite, true);
  }

  makeVehicle(x: number, y: number, color: number, traffic: boolean, label: string) {
    const c = this.add.container(x, y).setDepth(20);
    const sh = this.add.ellipse(2, 7, 56, 34, 0x0a1011, .38);
    const body = this.add.rectangle(0, 0, label === 'BUS' ? 72 : label === 'AUTO' ? 46 : 42,
      label === 'BUS' ? 30 : label === 'SCOOTER' ? 20 : 25, color).setStrokeStyle(2, 0x263034);
    const roof = this.add.rectangle(-1, -1, label === 'BUS' ? 44 : label === 'AUTO' ? 28 : 24,
      label === 'BUS' ? 20 : 13, 0x27383d).setStrokeStyle(1, 0xc4b37a, .75);
    const wind = this.add.rectangle(13, -1, 8, 12, 0x91c8d0, .85);
    const wheel1 = this.add.rectangle(-14, 13, 10, 5, 0x171b1c);
    const wheel2 = this.add.rectangle(14, 13, 10, 5, 0x171b1c);
    c.add([sh, body, roof, wind, wheel1, wheel2]);
    c.setData('vehicle', label);
    c.setData('traffic', traffic);
    if (!traffic) {
      this.physics.add.existing(c, true);
      c.setData('blocked', true);
    }
    return c;
  }

  toggleVehicle() {
    if (this.driving) {
      this.driving = false;
      this.speed = 0;
      this.onEvent({ type: 'drive', message: 'You step back onto the street.' });
      return;
    }
    const v = this.nearestVehicle(82);
    if (v) {
      this.car = v;
      this.driving = true;
      this.player.setPosition(v.x, v.y);
      this.onEvent({ type: 'drive', message: `You hopped on the ${v.getData('vehicle')}. Arrows/WASD to ride · E to hop off.` });
    } else {
      this.onEvent({ type: 'hint', message: 'No ride nearby. Walk up to the parked scooter or auto.' });
    }
  }

  nearestVehicle(r: number) {
    const vs = this.children.list.filter((o: any) =>
      o.getData?.('vehicle') && !o.getData('traffic')
    ) as Phaser.GameObjects.Container[];

    return vs.sort((a, b) =>
      Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y) -
      Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y)
    ).find(v => Phaser.Math.Distance.Between(this.player.x, this.player.y, v.x, v.y) < r);
  }

  interact() {
    if (this.driving) {
      this.toggleVehicle();
      return;
    }

    const p = this.people.map(x => ({
      p: x, d: Phaser.Math.Distance.Between(this.player.x, this.player.y, x.sprite.x, x.sprite.y)
    })).sort((a, b) => a.d - b.d)[0];

    if (p && p.d < 76) {
      const person = p.p;
      this.onEvent({ type: 'npc', name: person.name, message: `${person.job} · Wants to ${person.goal}` });
      return;
    }

    if (this.nearestVehicle(82)) {
      this.toggleVehicle();
      return;
    }

    if (this.player.x > 820 && this.player.x < 1130 && this.player.y > 545 && this.player.y < 825) {
      this.onEvent({ type: 'shop', message: 'Sri Lakshmi Stores · Water ₹20 · snack ₹35' });
      return;
    }

    this.onEvent({ type: 'hint', message: 'Walk close to a person, shop, or parked ride and press E.' });
  }

  update(_: number, dt: number) {
    if (!this.player) return;
    const k = this.keys;
    this.clock += dt;

    this.people.forEach((p, i) => {
      const t = this.clock / 1000 + p.phase;
      p.sprite.x = p.homeX + Math.sin(t * .35 + i) * 16;
      p.sprite.y = p.homeY + Math.cos(t * .42 + i) * 11;
      const label = p.sprite.getData('label') as Phaser.GameObjects.Text | undefined;
      label?.setPosition(p.sprite.x, p.sprite.y + 18);
    });

    // Traffic moves along the avenues.
    this.cars.forEach((car, i) => {
      car.x += dt * (.025 + i * .004);
      if (car.x > 2580) car.x = -30;
    });

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let dx = (k.A.isDown || k.LEFT.isDown ? -1 : 0) + (k.D.isDown || k.RIGHT.isDown ? 1 : 0);
    let dy = (k.W.isDown || k.UP.isDown ? -1 : 0) + (k.S.isDown || k.DOWN.isDown ? 1 : 0);
    if (dx && dy) { dx *= .707; dy *= .707; }

    if (!this.driving) {
      const mult = k.SHIFT.isDown ? 1.48 : 1;
      body.setVelocity(dx * 175 * mult, dy * 175 * mult);
      if (dx || dy) this.player.setRotation(Math.atan2(dy, dx) + Math.PI / 2);
    } else {
      const steer = (k.A.isDown || k.LEFT.isDown ? -1 : 0) + (k.D.isDown || k.RIGHT.isDown ? 1 : 0);
      if (k.W.isDown || k.UP.isDown) this.speed = Math.min(240, this.speed + dt * .19);
      else if (k.S.isDown || k.DOWN.isDown) this.speed = Math.max(-90, this.speed - dt * .25);
      else this.speed *= .985;

      this.car.rotation += steer * dt * .0025 * (.3 + Math.abs(this.speed) / 130);
      const nx = this.car.x + Math.sin(this.car.rotation) * this.speed * dt / 1000;
      const ny = this.car.y - Math.cos(this.car.rotation) * this.speed * dt / 1000;
      this.car.x = Phaser.Math.Clamp(nx, 35, 2565);
      this.car.y = Phaser.Math.Clamp(ny, 35, 1865);
      this.player.setPosition(this.car.x, this.car.y);
      body.setVelocity(0, 0);
    }

    const nearestPerson = this.people.map(p => ({
      p, d: Phaser.Math.Distance.Between(this.player.x, this.player.y, p.sprite.x, p.sprite.y)
    })).sort((a, b) => a.d - b.d)[0];
    const ride = this.nearestVehicle(82);
    let text = '';

    if (this.driving) text = 'E  HOP OFF';
    else if (nearestPerson && nearestPerson.d < 85)
      text = `E  TALK TO ${nearestPerson.p.name.toUpperCase()}  ·  ${nearestPerson.p.job.toUpperCase()}`;
    else if (ride) text = `E  RIDE THE ${ride.getData('vehicle')}`;
    else if (this.player.x > 820 && this.player.x < 1130 && this.player.y > 545 && this.player.y < 825)
      text = 'E  SHOP · WATER ₹20';

    if (text) {
      this.prompt.setText(text);
      this.prompt.setPosition(this.scale.width / 2, this.scale.height - 54);
      this.prompt.setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }
  }
}
