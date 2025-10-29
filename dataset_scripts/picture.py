import json
import time
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
import re

def slugify(name):
    # isimden slug üretir (ör: "Ciryl Gane" -> "ciryl-gane")
    return re.sub(r'[^a-z0-9-]', '', name.lower().replace(" ", "-"))

def fetch_fighter_image(slug):
    url = f"https://www.ufc.com/athlete/{slug}"
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.text, "html.parser")
        image_div = soup.find("div", class_="hero-profile__image-wrap")
        if image_div:
            img_tag = image_div.find("img")
            if img_tag and "src" in img_tag.attrs:
                return img_tag["src"]
    except Exception as e:
        print(f"Hata: {e}")
    return None


def update_fighters_json():
    with open("fighters_updated_new.json", "r", encoding="utf-8") as file:
        fighters = json.load(file)

    updated = False

    for fighter in tqdm(fighters, desc="Updating fighters"):
        if fighter.get("Picture") != "Unknown":
            continue  # zaten foto varsa geç

        name = fighter.get("Fighter")
        slug = slugify(name)
        image_url = fetch_fighter_image(slug)

        if image_url:
            fighter["Picture"] = image_url
            updated = True
        time.sleep(0.5)  # ban yememek için bekleme

    if updated:
        with open("fighters.json", "w", encoding="utf-8") as file:
            json.dump(fighters, file, indent=4, ensure_ascii=False)
        print("\n✅ fighters.json başarıyla güncellendi.")
    else:
        print("\nℹ Güncellenecek bir şey bulunamadı.")

if __name__ == "__main__":
    update_fighters_json()
