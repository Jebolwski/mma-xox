import json
import time
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

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


def update_fighters_json(max_workers=5):
    """
    Paralel olarak fighter resimlerini günceller
    max_workers: Aynı anda kaç fighter işlensin (3-10 arası önerilir)
    """
    with open("fighters_updated.json", "r", encoding="utf-8") as file:
        fighters = json.load(file)

    # Sadece Unknown olan fighter'ları filtrele
    fighters_to_update = [
        (idx, fighter) for idx, fighter in enumerate(fighters)
        if fighter.get("Picture") == "Unknown"
    ]

    if not fighters_to_update:
        print("\nℹ Güncellenecek bir şey bulunamadı.")
        return

    print(f"Toplam {len(fighters_to_update)} fighter güncellenecek...")

    updated_count = 0
    lock = threading.Lock()

    def process_fighter(idx_fighter):
        idx, fighter = idx_fighter
        name = fighter.get("Fighter")
        slug = slugify(name)
        image_url = fetch_fighter_image(slug)
        
        if image_url:
            return (idx, image_url)
        return None

    # Paralel işleme ile resim çekme
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Progress bar için
        futures = {
            executor.submit(process_fighter, item): item 
            for item in fighters_to_update
        }
        
        with tqdm(total=len(fighters_to_update), desc="Updating fighters") as pbar:
            for future in as_completed(futures):
                result = future.result()
                if result:
                    idx, image_url = result
                    with lock:
                        fighters[idx]["Picture"] = image_url
                        updated_count += 1
                pbar.update(1)

    # JSON'a kaydet
    if updated_count > 0:
        with open("fighters.json", "w", encoding="utf-8") as file:
            json.dump(fighters, file, indent=4, ensure_ascii=False)
        print(f"\n✅ fighters.json başarıyla güncellendi. ({updated_count} resim bulundu)")
    else:
        print("\nℹ Hiçbir resim bulunamadı.")


if __name__ == "__main__":
    # max_workers: Aynı anda kaç fighter işlensin
    # 5 = güvenli, 10 = hızlı ama biraz riskli (rate limiting)
    update_fighters_json(max_workers=5)