kaboom({
	global:true,
	fullscreen:true,
	scale:1.5,
	debug:true,
	clearColor: [0,0,0,1],
})
const bigJumpForce = 550
const enemySpeed= 20
const moveSpeed = 120 
const jumpForce = 360
let currentJumpForce = jumpForce
 
 let isJumping = true
 const fallDeath = 400

loadRoot('https://i.imgur.com/')
loadSprite('coin','wbKxhcd.png')
loadSprite('evilShroom','KPO3fR9.png')
loadSprite('brick','pogC9x5.png')
loadSprite('block','M6rwarW.png')
loadSprite('mario','Wb1qfhK.png')
loadSprite('mushroom','0wMd92p.png')
loadSprite('suprise','gesQ1KP.png')
loadSprite('unboxed','bdrLpi6.png')
loadSprite('pipeTopLeft','ReTPiWY.png')
loadSprite('pipeTopRight','hj2GK4n.png')
loadSprite('pipeBottomLeft','c1cYSbt.png')
loadSprite('pipeBottomRight','nqQ79eI.png')

loadSprite('blueBlock', 'fVscIbn.png')
loadSprite('blueBrick', '3e5YRQd.png')
loadSprite('blueSteel', 'gqVoI2b.png')
loadSprite('blueEvilShroom', 'SvV4ueD.png')
loadSprite('blueSurprise', 'RMqCc1G.png')

scene('game',({level, score}) =>{
	layers(['bg','obj','ui'],'obj')

	const maps = [
	[  
		'                                    ',
		'                                    ',
		'                                    ',
		'                                     ',
		'                                     ',
		'     $  =*== %                       ',
		'                                     ',
		'                                     ',
		'                      -+             ',
		'             ^     ^  ()             ',
		'========================  ===========',
	],
	[ '~                                       ~',
      '~                                       ~',
      '~                                       ~',
      '~                                       ~',
      '~                                       ~',
      '~        @@@@@@          xx             ~',
      '~                       xxx             ~',
      '~                      xxxx           -+~',
      '~              z   z  xxxxx           ()~',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
	],
	[
	 
	 	' }                                  }',
		' }                      }=====      }',
		' }                                  }',
		' }          *$                      }',
		' }                                  }',
		' }                                  }',
		' }         *}$                      }',
		' }                                  }',
		' }                                  }',
		' }    *@%@                x         }',
		' }                       xx         }',
		' }                      xxx      -+ }',
		' }            z    z   xxxx      () }',
		'!!!!!!!!!!!!!!!!!!!!!!!!!!!   !!!!!!!',       
		
	]
]
	

	const levelCfg ={
		width:20,
		height:20,
		'=': [sprite('block'), solid()],
		'$': [sprite('coin'),'coin' ],
		'%': [sprite('suprise'), solid(), 'coin-surprise'],
		'*': [sprite('suprise'), solid(),'mushroom-surprise'],
		'}': [sprite('unboxed'), solid()],
		'(': [sprite('pipeBottomLeft'), solid(),scale(0.5),'pipe'],
    	')': [sprite('pipeBottomRight'), solid(), scale(0.5),'pipe'],
    	'-': [sprite('pipeTopLeft'), solid(),scale(0.5),'pipe' ],
    	'+': [sprite('pipeTopRight'), solid(), scale(0.5),'pipe'],
    	'^':[sprite('evilShroom'), solid(),  'dangerous'],
        '&': [sprite('mushroom'),solid(),'mushroom', body() ],

        '!': [sprite('blueBlock'), solid(), scale(0.5)],
    	'~': [sprite('blueBrick'), solid(), scale(0.5)],
    	'z': [sprite('blueEvilShroom'), solid(), scale(0.5), 'dangerous'],
    	'@': [sprite('blueSurprise'), solid(), scale(0.5), 'coin-surprise'],
    	'x': [sprite('blueSteel'), solid(), scale(0.5)],
    	
	}

	const gameLevel = addLevel(maps[level],levelCfg)

	const scoreLabel = add([
		text('score'),
		pos(30,6),
		layer('ui'),
		{
			value: score,
		}
	])

	add([text('level' + parseInt(level+1), pos(4,6))])

	function big(){
		let timer = 0
		let isBig = false
		return {
			update(){
				if(isBig){
					currentJumpForce = bigJumpForce
					timer-=dt()
					if(timer <= 0){
						this.smallify
					}
				}
			},
			isBig(){
				return isBig
			},
			smallify(){
				this.scale = vec2(1)
				currentJumpForce = jumpForce
				timer=0
				isBig = false 
			},
			biggify(time){
				this.scale = vec2(2)
				
				timer= time
				isBig = true
			}
		}
	}

	const player = add([
		sprite('mario'), solid(),
		pos(30,0),
		body(),
		big(),
		origin('bot')
	])

	action('mushroom',(m) =>{
		m.move(20,0)
	})

	  player.on('headbump', (obj) => {
    if (obj.is('coin-surprise')) {
      gameLevel.spawn('$', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0,0))
    }
    if (obj.is('mushroom-surprise')) {
      gameLevel.spawn('&', obj.gridPos.sub(0, 1))
      // destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0,0))
    }
  })
 
	 player.collides('mushroom',(m) => {
		player.biggify(3)
 		destroy(m)
	 })

	  player.collides('coin',(c) => {
		destroy(c)
		scoreLabel.value++
		scoreLabel.text = scoreLabel.value
	 })

 	action('dangerous', (d) => {
    	d.move(-enemySpeed, 0)
    })

 	 player.collides('dangerous', (d) => {
  	  	if (isJumping) {
    	  destroy(d)
   		 } else {
     	 go('lose', { score: scoreLabel.value})
   		 }
 	 })
	


	   player.action(() => {
	   	camPos(player.pos)
	   	if(player.pos.y >= fallDeath){
	   		go('lose', {score: scoreLabel.value})
	   	}
	   })

	 
  player.collides('pipe', () => {
    keyPress('down', () => {
      go('game', {
        level: (level + 1) % maps.length,
        score: scoreLabel.value
      })
    })
  })

	 keyDown('left', () => {
    	player.move(-moveSpeed, 0)
    })

	keyDown('right', () => {
		player.move(moveSpeed, 0)
	})

	player.action(() =>{
		if(player.grounded()){
			isJumping = false
		}
	})
	keyPress('space', () => {
		if(player.grounded()) { 
			player.jump(currentJumpForce)
			isJumping=true
		}
	}) 

})

scene('lose', ({ score }) => {
  add([text(score, 32), origin('center'), pos(width()/2, height()/ 2)])
})

start('game',{level:0, score:0})