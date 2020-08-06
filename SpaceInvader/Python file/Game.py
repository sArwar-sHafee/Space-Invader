import pygame
import math
import random
from pygame import mixer
clock = pygame.time.Clock()
pygame.init()
mixer.init()
a2 = 0
pygame.display.set_caption('Mini_Game')
icon = pygame.image.load("octo1.png")
pygame.display.set_icon(icon)
scr = pygame.display.set_mode([800,600], pygame.FULLSCREEN) 
       
bg = pygame.image.load("1876bg.jpg")
mixer.music.load('bg.wav')    
mixer.music.play(-1)   

playerImage = pygame.image.load("ship.png")
pX= 384
pY = 520
p_change = 0 
def player(x,y):
    scr.blit(playerImage, (x , y))
"""
def cloud(x,y):
    scr.blit(cI, (x , y))
    
cI = pygame.image.load('cloud.png')
cX = 2000
cY = 2000

""" 
    
seX = 1.5
seY = 32
enemyImage = []
eX = []
eY = []
e_changeX = []
e_changeY = []
enumber = 10
def eenemy():
    for i in range(enumber):
        enemyImage.append(pygame.image.load("octo2.png"))
        eX.append(random.randint(0,768))
        eY.append(random.randint(0, 10))
        e_changeX.append(seX) 
        e_changeY.append(seY)
eenemy()
def enemy(x, y, i):
    scr.blit(enemyImage[i], (x , y))


bulletImage = pygame.image.load("bullet.png")
bX= pX
bY = pY
b_changeX = 0 
b_changeY = 14
b_state = "ready"
def bulletf(x,y):
    global b_state
    b_state = "fire"
    scr.blit(bulletImage, (x+16 , y))
def collision(eX,eY,bX,bY):
    try:
        d = math.sqrt((eY - bY)**2 + (eX - bX)**2)
    except:
        d = 30
    if d < 27:
        return True
    else:
        return False

score = 0
f = pygame.font.SysFont('arial', 32)
tX = 10
tY = 10
def sScore(x, y):
    ss = f.render("Score:"+str(score), True, (0, 255, 0))
    scr.blit(ss, (x, y))


g = pygame.font.SysFont('arial', 32)
def game_over():
    gs = g.render("GAME OVER", True, (255, 0, 0))
    scr.blit(gs, (300, 300))
    
w = pygame.font.SysFont('arial', 32)    
def you_won():
    ws = w.render('YOU WIN', True, (0, 0, 255))
    scr.blit(ws, (300, 300))
    for i in range(enumber):
        eX[i] = 2000

running =True
while running:
    #scr.fill([0, 0, 255])
    clock.tick(60)
    scr.blit(bg, (0, 0))
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False   
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT:
                #print("Key Left is Pressed")
                p_change += -2.5 
            elif event.key == pygame.K_RIGHT:
                #print("Key RIGHT is Pressed")
                p_change += 2.5
            elif event.key == pygame.K_SPACE:
                if b_state == 'ready':
                    b_sound = mixer.Sound('fire.wav')
                    b_sound.play()
                    bX = pX
                    bulletf(bX,bY)
            elif event.key == pygame.K_ESCAPE:
                running = False
        elif event.type == pygame.KEYUP:
            if event.key == pygame.K_LEFT or event.key == pygame.K_RIGHT:
                #print("Key Relised")
                p_change = 0
        
    pX = p_change + pX
    if pX <=0:
        pX = 0
    if pX >= 768:
        pX=768
    for i in range(enumber): 
        if eY[i] >= 510 and (eX[i] >= pX - 32 and eX[i] <= pX +32):
            for i in range(enumber): 
                eY[i] = 2000
            if a2 == 0:
                b_sound = mixer.Sound('burst.wav')
                b_sound.play()
                a2 = 1
            game_over()
            pX = 2000
            pY = 2000
            break
        eX[i] += e_changeX[i]
        if eX[i] <=0:
            e_changeX[i] = seX
            eY[i] += e_changeY[i]
        if eX[i] >= 768:
            e_changeX[i] = -seX
            eY[i] += e_changeY[i]
        
        c = collision(eX[i],eY[i],bX,bY)
        if c:
            bX = pX
            bY = pY
            b_state = 'ready'
            score += 1
            #print(score)
            eX[i] = random.randint(0, 768)
            eY[i] = random.randint(0, 10)
            try:
             e_sound = mixer.Sound('die.wav')
             e_sound.play()
            except:
             print("can not do it")    
             
        enemy(eX[i], eY[i], i)
        
    if b_state == 'fire':
        bulletf(bX, bY)
        bY -= b_changeY  
    if bY < -12:
        bY = pY
        b_state = 'ready'
        
        
    player(pX, pY)
    sScore(tX, tY)
    pygame.display.update()
    
    if score == 20:
        seX = 2.5
        seY = 64
        enumber = 15
        bell = mixer.Sound('bell.wav')
        bell.play()
        eenemy()
        score += 1
    elif score == 40:
        seX = 3.5
        seY = 80
        enumber = 20
        bell = mixer.Sound('bell.wav')
        bell.play()
        eenemy()
        score += 1
    elif score == 60:
        seX = 4.5
        seY = 96
        enumber = 30
        bell = mixer.Sound('bell.wav')
        bell.play()
        score += 1
        eenemy()
    elif score == 80:
        seX = 6
        seY = 112
        enumber = 40
        bell = mixer.Sound('bell.wav')
        bell.play()
        eenemy()
        score += 1
    elif score == 100:
        you_won()
        

                        
pygame.quit()
