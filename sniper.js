javascript:(function() {
	const e = {
		name: "sniper", //12
            // description: `fire a wide <strong>burst</strong> of short range <strong> bullets</strong><br>with a low <strong><em>fire rate</em></strong><br><strong>3-4</strong> nails per ${powerUps.orb.ammo()}`,
            descriptionFunction() {
                return `fires a <strong>high caliber</strong> long-range shot <strong></strong><br>has a very slow <strong><em>fire rate</em></strong><br><strong>${this.ammoPack.toFixed(1)}</strong> shots per ${powerUps.orb.ammo()}`
            },
            ammo: 0,
            ammoPack: 1,
            defaultAmmoPack: 1,
            have: false,
            do() {
                // draw loop around player head
                const left = m.fireCDcycle !== Infinity ? 0.05 * Math.max(m.fireCDcycle - m.cycle, 0) : 0
                if (left > 0) {
                    ctx.beginPath();
                    // ctx.arc(simulation.mouseInGame.x, simulation.mouseInGame.y, 30, 0, left);
                    ctx.arc(m.pos.x, m.pos.y, 28, m.angle - left, m.angle);
                    // ctx.fillStyle = "rgba(0,0,0,0.3)" //"#333"
                    // ctx.fill();
                    ctx.strokeStyle = "#333";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

            },
            fire() {
                let knock, spread
                const coolDown = function () {
                    spread = 0
                    m.fireCDcycle = ((m.cycle + Math.floor((150) * b.fireCDscale)) - (tech.isTacticalEfficiency * 10)) // cool down
                    knock = 1
                }

                const antimatter = () => {
                    if (tech.isAntimatter && !(m.health < 0.05)) {
                        healthLoss = (0.05 / m.health)
                        m.health -= healthLoss
                        m.energy += healthLoss
                        m.displayHealth();
                    }
                }

                const spray = () => {
                    const totalBullets = 3;
                    for (let i = 0; i < totalBullets; i++) {
                        const me = bullet.length;
                        const dir = m.angle
                        bullet[me] = Bodies.rectangle(m.pos.x, m.pos.y, 50, 10, b.fireAttributes(dir));
                        Composite.add(engine.world, bullet[me]); //add bullet to world
                        const SPEED = (200 + Math.random() * 2) - (tech.isTacticalEfficiency * 25)
                        Matter.Body.setVelocity(bullet[me], {
                            x: SPEED * Math.cos(dir),
                            y: SPEED * Math.sin(dir)
                        });
                        bullet[me].endCycle = simulation.cycle + 5000
                        bullet[me].minDmgSpeed = 1
                        // bullet[me].restitution = 0.4
                        bullet[me].frictionAir = 0.005;
                        bullet[me].do = function () {
                            const scale = 1 - 0.01 / tech.bulletsLastLonger
                            Matter.Body.scale(this, scale, scale);
                        };
                    }
                }

                const multiShot = function () {
                    if (tech.isAdditionalRounds >= 0) {
                        const totalBullets = tech.isAdditionalRounds
                        for (let i = 0; i < totalBullets; i++) {
                            const me = bullet.length;
                            const dir = Math.floor(Math.random() * 360)
                            bullet[me] = Bodies.rectangle(m.pos.x, m.pos.y, 50, 10, b.fireAttributes(dir));
                            Composite.add(engine.world, bullet[me]); //add bullet to world
                            const SPEED = (200 + Math.random() * 2) - (tech.isTacticalEfficiency * 25)
                            Matter.Body.setVelocity(bullet[me], {
                                x: SPEED * Math.cos(dir),
                                y: SPEED * Math.sin(dir)
                            });
                            bullet[me].endCycle = simulation.cycle + 5000
                            bullet[me].minDmgSpeed = 1
                            // bullet[me].restitution = 0.4
                            bullet[me].frictionAir = 0.005;
                            bullet[me].do = function () {
                                const scale = 1 - 0.01 / tech.bulletsLastLonger
                                Matter.Body.scale(this, scale, scale);
                            };
                        }
                    }
                }

                const isSniperDefense = function () {
                    if (tech.isSniperDefense) {
                        m.fieldHarmReduction = 0.75
                    }
                }

                const isZoom = function () {
                    if (tech.isSniperZoom) {
                        document.body.addEventListener("wheel", (e) => {
                            if (e.deltaY > 0) {
                                simulation.setZoom(simulation.zoomScale - 10)
                            } else {
                                simulation.setZoom(simulation.zoomScale + 10)
                            }
                        });
                    }
                }

                const chooseBulletType = function () {
                    if (tech.isExplodeSnipe) {
                        spread = 0;
                        const END = Math.floor(m.crouch ? 8 : 5);
                        const totalBullets = 2
                        let dir = m.angle
                        for (let i = 0; i < totalBullets; i++) {
                            const me = bullet.length;
                            bullet[me] = Bodies.rectangle(m.pos.x + 50 * Math.cos(m.angle), m.pos.y + 50 * Math.sin(m.angle), 60, 20, b.fireAttributes(dir));
                            const end = END + Math.random() * 50
                            bullet[me].endCycle = 2 * end * tech.bulletsLastLonger + simulation.cycle
                            const speed = (200 + Math.random() * 2) - (tech.isTacticalEfficiency * 25)
                            const dirOff = dir
                            Matter.Body.setVelocity(bullet[me], {
                                x: speed * Math.cos(dirOff),
                                y: speed * Math.sin(dirOff)
                            });
                            bullet[me].onEnd = function () {
                                b.explosion(this.position, 180 * (tech.isShotgunReversed ? 1.4 : 1) + (Math.random() - 0.5) * 30); //makes bullet do explosive damage at end
                            }
                            bullet[me].beforeDmg = function () {
                                this.endCycle = 0; //bullet ends cycle after hitting a mob and triggers explosion
                            };
                            bullet[me].do = function () {
                                if (Matter.Query.collides(this, map).length) this.endCycle = 0; //bullet ends cycle after hitting a mob and triggers explosion
                            }
                            Composite.add(engine.world, bullet[me]); //add bullet to world
                        }
                    } else {
                    spray(16);
                    }
                }
                isSniperDefense();
                isZoom();
                coolDown();
                b.muzzleFlash(35);
                antimatter();
                chooseBulletType();
                multiShot();
            }
	};
	b.guns.push(e);
	const gunArray = b.guns.filter(
	(obj, index, self) =>
		index === self.findIndex((item) => item.name === obj.name)
	);
	b.guns = gunArray;
	const t = [
		{
			name: "focused shielding",
			description: "while <strong>sniper</strong> is equiped <strong>0.75x</strong> <strong class='color-defense'>damage taken</strong>",
			isGunTech: true,
			maxCount: 1,
			count: 0,
			isInstant: true,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return (tech.haveGunCheck("sniper"))
			},
			requires: "sniper",
			effect() {
				tech.isSniperDefense = true
			},
			remove() {
				tech.isSniperDefense = false
			}
		},
		{
			name: "tactical efficiency",
			description: `increased <strong>sniper</strong> fire rate, decreased bullet <strong>speed</strong>`,
			isGunTech: 1,
			maxCount: 4,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return (tech.haveGunCheck("sniper")) && !tech.isFireMoveLock
			},
			requires: "sniper, not Higgs mechanism",
			effect() {
				tech.isTacticalEfficiency += 1
			},
			remove() {
				tech.isTacticalEfficiency = 0
			}
		},
		{
			name: "optical zoom",
			description: `<strong>scroll</strong> the mouse wheel to <strong>zoom</strong> in and out`,
			isGunTech: 1,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return (tech.haveGunCheck("sniper"))
			},
			requires: "sniper",
			effect() {
				tech.isSniperZoom = true
			},
			remove() {
				tech.isSniperZoom = false
			}
		},
		{
			name: "additional rounds",
			description: `<strong>sniper</strong> shoots another bullet in a <strong>random</strong> direction`,
			isGunTech: 1,
			maxCount: 9,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return (tech.haveGunCheck("sniper"))
			},
			requires: "sniper",
			effect() {
				tech.isAdditionalRounds += 1
			},
			remove() {
				tech.isAdditionalRounds = 0
			}
		},
		{
			name: "explosive hollow-points",
			description: `<strong>sniper shots</strong> are <strong class='color-e'>explosive</strong>`,
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return (tech.haveGunCheck("sniper"))
			},
			requires: "sniper",
			effect() {
				tech.isExplodeSnipe = true
			},
			remove() {
				tech.isExplodeSnipe = false
			}
		},
	];
	t.reverse();
	for(let i = 0; i < tech.tech.length; i++) {
		if(tech.tech[i].name === 'spherical harmonics') {
			for(let j = 0; j < t.length; j++) {
				tech.tech.splice(i, 0, t[j]);
			}
			break;
		}
	}
	const techArray = tech.tech.filter(
		(obj, index, self) =>
			index === self.findIndex((item) => item.name === obj.name)
		);
	tech.tech = techArray;
	console.log("Sniper Mod: Installation Succesful");
})();