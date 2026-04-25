import json
import sys
import time
import pyperclip
from selenium import webdriver 
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import selenium 
driver = webdriver.Firefox()
from datetime import datetime

try:
    driver.get("https://thatsabingo.com/history")
    time.sleep(1)
    input_box = driver.find_element(By.XPATH, "/html/body/div[1]/div/div/div[1]/label/input")
except selenium.common.exceptions.NoSuchElementException:
    print("No such element")
    driver.close()
    sys.exit()

try:
    input_box.send_keys(Keys.BACKSPACE)
    input_box.send_keys(1)
    input_box.send_keys(Keys.ENTER)
    time.sleep(1)
except selenium.common.exceptions.ElementNotInteractableException:
    print("input_box isn't interactable")
    driver.close()
    sys.exit()
except selenium.common.exceptions.StateElementReferenceException:
    print("input_box is stale")
    driver.close()
    sys.exit()
except selenium.common.exceptions.NoSuchElementException:
    print("input_box not found")
    driver.close()
    sys.exit()

try:
    json_area = driver.find_element(By.CSS_SELECTOR, "#main > div > div > div.json-section > textarea")
    json_value = json_area.get_attribute("value")
except selenium.common.exceptions.NoSuchElementException:
    print("json_area not found")
    driver.close()
    sys.exit()
except selenium.common.exceptions.ElementNotInteractable:
    print("json_area is not interactable")
    driver.close()
    sys.exit()
except selenium.common.exceptions.StaleElementReferenceEXception:
    print("json_area is stale")
    driver.close()
    sys.exit()
except selenium.common.exceptions.WebDriverException:
    print("webdriver issue")
    driver.close()
    sys.exit()
finally:
    driver.close()
data = json.loads(json_value)

mList = ["ATV", "Accident", "Actin' a Fool", "Ambulance", "Ammunition", "Ankle Bracelet", "Anything Illegal", "Armed Robbery", "Arrested", "Assault", "Assault Rifle", "Barefoot", "Barking Dog", "Beer", "Bicycle", "Bing Bing Bingo", "Birthday", "Blood", "Blunt", "Breathalyzer", "Brick O' Weed", "Broken Headlight", "Broken Taillight", "Burglary", "Call Clinger", "Camouflage", "Camera Operator Olympics", "Car Chase", "Car Seat", "Censor Overload", "Child Neglect", "Choo Choo", "Cigarette", "Cocaine", "Code Brown", "Convict", "Cop Take Down", "Cranium Art", "Crying", "Cycling Dirty", "DUI Test", "Daisy Dukes", "Dan Abrams Stand-up", "Destroying Evidence", "Dog Bite", "Dollar Store", "Domestic Animal", "Domestic Disturbance", "Don't Film Me", "Drone", "Drug Bust", "Drug Paraphernalia", "Drugs Tossed", "Evidence on Car", "Farm Animal", "Fence Jumper", "Field Test", "Fight", "Filming a Documentary", "Fire", "Fire Engine", "Fist Bump", "Five Finger Discount", "Foot Chase", "Frequent-Flyer", "Get a Room", "Giftie", "Goober Grazing", "Good Samaritan", "Got Talent", "Gun Found", "Gun Show", "Gurney Deployed", "Handcuffed", "Hands Up", "Handshake", "Helicopter", "Hit & Run", "High-Vis Clothing", "Home Base", "Hooker", "Hoopty", "Id Issues", "I'll Have Your Badge", "Just Bought It", "K9 Used", "Kitty Cat", "Knife Found", "Latex Gloves", "Lawnmower", "Liar, Liar", "Littering and", "Liquor", "Lost in Translation", "Lovers", "Man Bun", "Meth", "Moonwalker", "Motorcycle Chase", "Narcan", "Needle", "Nice Trip", "Night Vision", "No Insurance", "No Pants", "No Seat Belt", "Noise Complaint", "Not My...", "Off Fleek", "Open Container", "Opioids", "PIT Maneuver", "Personal Locker", "Pills", "Pipe", "Plate Problems", "Police Tape", "Pour it Out", "Probation", "Pull to the Right", "Resisting Arrest", "Retail Therapist", "Ridin' Dirty", "Ridin' Dirty Trifecta", "Rights Read", "Rock and Roll All Nite", "Sagging Pants", "Scales", "Search", "Send Backup", "Sex Offender", "Sexy Time", "Shirtless", "Shopping Cart", "Shotgun", "Shots Fired", "Shout-out", "Show the Tape", "Smells Like Weed", "Snow", "Socks 'n Slides", "Spike Strip", "Spitting", "Sports Fan", "Stolen Car", "Street Lawyer", "Superhero", "Suspicious Vehicle", "Tag Light", "Talked Myself Into Cuffs", "Taser", "Tattoos", "Thank You", "Tint Violation", "Touch Tail Light", "Tow Truck", "Traffic Cone", "Traffic Stop", "Trespassing", "Two Beers", "U-Haul", "Underage Drinking", "Urine Trouble", "Vest Rest", "Wad of Cash", "Waffle House", "Warning", "Warrant", "Weed Found", "Welcome to the Jungle", "Welfare Check", "Wild Animal", "Word to Your Mother", "Wrong Way Driver", "Your Incident Has Been Updated"]

data = data[0]
date = data["date"]
date = datetime.strptime(date, "%m/%d/%Y")
year = date.year
date = date.strftime("%Y-%m-%d")
with open(f"{year}/{date}.json", "w+") as f:
    f.write(json.dumps(data, indent=2))
terms = data.get("terms", {})

lines = []
missing = []
for term in mList:
    if term not in terms:
        missing.append(term)
        lines.append("N")
    else:
        confirmed = terms[term].get("confirmed", False)
        lines.append("Y" if confirmed else "N")

if missing:
    print("Terms in master list but not found in file:")
    for t in missing:
        print(f"  - {t}")
    print(f"Total Missing: {len(missing)}")

all_term_keys = list(terms.keys())
new_terms = [t for t in all_term_keys[1:] if t not in mList]
if new_terms:
    print("New terms in file not in master list:")
    for t in new_terms:
        print(f"  + {t}")

pyperclip.copy("\n".join(lines) + "\n")
print(f"Processed latest bingo and copied to clipboard")