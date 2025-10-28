import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urljoin
from datetime import datetime
from dateutil import parser

class UFCStatsScraper:
    def __init__(self):
        self.base_url = "http://ufcstats.com"
        self.fighters_url = f"{self.base_url}/statistics/fighters"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
    def get_all_fighter_links(self):
        """Tüm dövüşçülerin detay sayfası linklerini topla"""
        print("Dövüşçü linkleri toplanıyor...")
        fighter_links = []
        
        # Her harf için sayfa al
        for letter in 'abcdefghijklmnopqrstuvwxyz':
            url = f"{self.fighters_url}?char={letter}&page=all"
            try:
                response = requests.get(url, headers=self.headers, timeout=10)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Dövüşçü linklerini bul
                rows = soup.find_all('tr', class_='b-statistics__table-row')
                for row in rows:
                    link = row.find('a', class_='b-link')
                    if link and link.get('href'):
                        fighter_links.append(link['href'])
                
                print(f"Harf {letter.upper()}: {len([l for l in fighter_links if letter in l.lower()])} dövüşçü")
                time.sleep(0.5)  # Rate limiting
                
            except Exception as e:
                print(f"Hata ({letter}): {e}")
                continue
                
        print(f"Toplam {len(fighter_links)} dövüşçü bulundu")
        return fighter_links
    
    def parse_fighter_weight_classes(self, soup):
        """
        Dövüşçünün tüm UFC maçlarından sikletlerini toplar.
        """
        weight_classes = set()
        fight_rows = soup.find_all('tr', class_='b-fight-details__table-row')[1:]

        for row in fight_rows:
            cols = row.find_all('td')
            if len(cols) < 7:
                continue

            event_name = cols[6].text.strip()
            if not is_ufc_event(event_name):
                continue

            onclick_attr = row.get('onclick', '')
            match = re.search(r"doNav\('(http[^']+)'\)", onclick_attr)
            fight_url = match.group(1) if match else None

            if fight_url:
                try:
                    response = requests.get(fight_url, headers=self.headers, timeout=10)
                    fight_soup = BeautifulSoup(response.content, 'html.parser')

                    fight_title_tag = fight_soup.find('i', class_='b-fight-details__fight-title')
                    if fight_title_tag:
                        text = fight_title_tag.get_text(strip=True)
                        pat = re.compile(r'(?i)(?:UFC\s+)?(?:Interim\s*)?([A-Za-z]+(?:\s+[A-Za-z]+)*)\s*Bout')
                        m = pat.search(text)
                        if m:
                            division_str = m.group(1).strip()
                            # remove leading "Interim" and trailing "Title" (case-insensitive)
                            division_str = re.sub(r'^\s*interim\s*', '', division_str, flags=re.I)
                            division_str = re.sub(r'\s+title\s*$', '', division_str, flags=re.I)
                            # normalize internal spaces and title-case
                            division_str = re.sub(r'\s+', ' ', division_str).title().strip()
                            if division_str:
                                weight_classes.add(division_str)
                except Exception as e:
                    print(f"Hata fight-details ({fight_url}): {e}")
                    continue

                time.sleep(0.5)

        return list(weight_classes)

    def parse_fighter_details(self, fighter_url, old_data=None):
        """Tek bir dövüşçünün detaylarını çek ve eskiden varsa eski verilerden eksikleri al"""
        try:
            response = requests.get(fighter_url, headers=self.headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')

            fighter_data = {}

            # İsim
            name_tag = soup.find('span', class_='b-content__title-highlight')
            fighter_data['Fighter'] = name_tag.text.strip() if name_tag else "Unknown"

            # Nickname
            nickname_tag = soup.find('p', class_='b-content__Nickname')
            fighter_data['Nickname'] = nickname_tag.text.strip() if nickname_tag else ""

            # Detay bilgileri (Boy, Kilo, Reach, Stance, DOB)
            details = soup.find_all('li', class_='b-list__box-list-item')
            for detail in details:
                label_tag = detail.find('i', class_='b-list__box-item-title')
                if not label_tag:
                    continue
                label = label_tag.text.strip().lower()
                value = detail.get_text(strip=True).replace(label_tag.text.strip(), '').strip()
                if 'height' in label:
                    height_match = re.search(r"(\d+)'\s*(\d+)\"", value)
                    if height_match:
                        feet, inches = int(height_match.group(1)), int(height_match.group(2))
                        cm = (feet * 12 + inches) * 2.54
                        fighter_data['HeightCms'] = f"{cm:.2f}"
                elif 'weight' in label:
                    weight_match = re.search(r'(\d+)', value)
                    fighter_data['WeightLbs'] = weight_match.group(1) if weight_match else ""
                elif 'reach' in label:
                    reach_match = re.search(r'(\d+)', value)
                    if reach_match:
                        fighter_data['ReachCms'] = str(float(reach_match.group(1)) * 2.54)
                elif 'stance' in label:
                    fighter_data['Stance'] = value if value != '--' else "Unknown"
                elif 'dob' in label:
                    fighter_data['DOB'] = value
                    dob_raw = value.strip().replace('\n', '').replace('\t', '')
                    try:
                        dob = parser.parse(dob_raw)
                        today = datetime.today()
                        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                        fighter_data['Age'] = str(age)
                    except:
                        fighter_data['Age'] = ""

            # Record
            record_tag = soup.find('span', class_='b-content__title-record')
            if record_tag:
                match = re.search(r'Record:\s*(\d+)-(\d+)-(\d+)', record_tag.text.strip())
                if match:
                    fighter_data['Wins'] = match.group(1)
                    fighter_data['Losses'] = match.group(2)
                    fighter_data['Draws'] = match.group(3)

            # Maç geçmişi ve UFC fight kontrolü
            fight_rows = [row for row in soup.find_all('tr', class_='b-fight-details__table-row')[1:]
                          if is_ufc_event(row.find_all('td')[6].text.strip())]
            if len(fight_rows) == 0:
                print(f"{fighter_data['Fighter']} UFC Fight Night veya PPV’de hiç dövüşmedi, atlanıyor.")
                return None

            # Fight history istatistikleri
            fight_stats = self.parse_fight_history(soup)
            fighter_data.update(fight_stats)

            # Sikletleri topla
            fighter_data['WeightClasses'] = self.parse_fighter_weight_classes(soup)

            # --- Convert WeightClasses into old-style comma-separated WeightLbs string ---
            division_to_lbs = {
                "Strawweight": 115,
                "Flyweight": 125,
                "Bantamweight": 135,
                "Featherweight": 145,
                "Lightweight": 155,
                "Welterweight": 170,
                "Middleweight": 185,
                "Light Heavyweight": 205,
                "Heavyweight": 265,
            }

            classes = fighter_data.get("WeightClasses") or []
            lbs_values = []
            for div in classes:
                if not div:
                    continue
                # Normalize common variants (e.g. "Light Heavyweight" vs "Lightheavyweight")
                key = div.strip().title()
                if key in division_to_lbs:
                    lbs_values.append(division_to_lbs[key])
            # Fallback: if we didn't detect mapped classes, preserve existing single weight parsed earlier
            if lbs_values:
                # unique + sorted, then join as "185, 205"
                unique_sorted = sorted(set(lbs_values))
                fighter_data['WeightLbs'] = ", ".join(str(x) for x in unique_sorted)
            else:
                # keep whatever was parsed from the "Weight" detail (already in fighter_data['WeightLbs'])
                fighter_data['WeightLbs'] = fighter_data.get('WeightLbs', "")
            # --- end conversion ---

            # Resim
            img_tag = soup.find('img', class_='b-link__image')
            if old_data and 'Fighter' in fighter_data:
                for old_f in old_data:
                    if old_f['Fighter'] == fighter_data['Fighter']:
                        fighter_data['Picture'] = old_f.get('Picture', 'Unknown')
                        for k, v in old_f.items():
                            if k not in fighter_data:
                                fighter_data[k] = v
                        break
            else:
                fighter_data['Picture'] = img_tag['src'] if img_tag and img_tag.get('src') else "Unknown"

            return fighter_data

        except Exception as e:
            print(f"Hata ({fighter_url}): {e}")
            return None

    def parse_fight_history(self, soup):
        stats = {
            'totalRoundsFought': '0',
            'WinsBySubmission': '0',
            'WinsByDecisionUnanimous': '0',
            'WinsByDecisionSplit': '0',
            'WinsByDecisionMajority': '0',
            'WinsByTKO': '0',
            'CurrentWinStreak': '0',
            'CurrentLoseStreak': '0',
            'LongestWinStreak': '0',
            'TotalTitleBouts': '0',
            'NoContest': '0'
        }

        try:
            fight_rows = soup.find_all('tr', class_='b-fight-details__table-row')

            total_rounds = 0
            win_streak = 0
            lose_streak = 0
            longest_win = 0
            title_bouts = 0
            no_contest = 0

            ko_wins = 0
            sub_wins = 0
            dec_u_wins = 0
            dec_s_wins = 0
            tko_wins = 0
            dec_m_wins = 0

            for row in reversed(fight_rows[1:]):
                cols = row.find_all('td')
                if len(cols) < 9:
                    continue

                event_name = cols[6].text.strip()
                # if not is_ufc_event(event_name):
                #     continue  # UFC dışında ise bu maçı atla

                result = cols[0].text.strip().lower()
                # No Contest yakala
                if 'nc' in result:
                    no_contest += 1
                    win_streak = 0
                    lose_streak = 0
                    continue  # streak hesaplamaya dahil etme

                if 'win' in result:
                    win_streak += 1
                    lose_streak = 0
                    longest_win = max(longest_win, win_streak)
                    method = cols[7].text.strip().lower()
                    if 'ko' in method and 'tko' not in method:
                        ko_wins += 1
                    elif 'tko' in method or 'doctor' in method:
                        tko_wins += 1
                    elif 'sub' in method:
                        sub_wins += 1
                    elif 'u-dec' in method:
                        dec_u_wins += 1
                    elif 's-dec' in method:
                        dec_s_wins += 1
                    elif 'm-dec' in method:
                        dec_m_wins += 1

                elif 'loss' in result:
                    lose_streak += 1
                    win_streak = 0

                # Round sayısı
                round_text = cols[8].text.strip()
                if round_text.isdigit():
                    total_rounds += int(round_text)

                # Title bout kontrolü
                title_col = cols[6]
                if title_col.find('img', alt=True):
                    # belt.png var ise title fight
                    title_bouts += 1

            # İstatistikleri güncelle
            stats['totalRoundsFought'] = str(total_rounds)
            stats['WinsBySubmission'] = str(sub_wins)
            stats['WinsByDecisionUnanimous'] = str(dec_u_wins)
            stats['WinsByDecisionSplit'] = str(dec_s_wins)
            stats['WinsByDecisionMajority'] = str(dec_m_wins)
            stats['WinsByTKO'] = str(tko_wins + ko_wins)
            stats['CurrentWinStreak'] = str(win_streak)
            stats['CurrentLoseStreak'] = str(lose_streak)
            stats['LongestWinStreak'] = str(longest_win)
            stats['TotalTitleBouts'] = str(title_bouts)
            stats['NoContest'] = str(no_contest)

        except Exception as e:
            print(f"Fight history parse hatası: {e}")

        return stats

    

    def scrape_all_fighters(self, limit=None):
        """Tüm dövüşçüleri scrape et"""
        fighter_links = self.get_all_fighter_links()
        
        if limit:
            fighter_links = fighter_links[:limit]
        
        all_fighters = []
        
        for idx, link in enumerate(fighter_links, 1):
            print(f"İşleniyor ({idx}/{len(fighter_links)}): {link}")
            fighter_data = self.parse_fighter_details(link)
            
            if fighter_data:
                fighter_data['Id'] = idx
                all_fighters.append(fighter_data)
            
            time.sleep(1)  # Rate limiting - önemli!
            
            # Her 50 dövüşçüde bir kaydet
            if idx % 500 == 0:
                self.save_to_json(all_fighters, f'ufc_fighters_backup_{idx}.json')
        
        return all_fighters
    
    def save_to_json(self, data, filename='ufc_fighters_updated.json'):
        """Veriyi JSON olarak kaydet"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print(f"Veri kaydedildi: {filename}")
    
    def update_existing_dataset(self, old_data_file):
        """Mevcut verisetini güncelle"""
        with open(old_data_file, 'r', encoding='utf-8') as f:
            old_data = json.load(f)
        
        print(f"{len(old_data)} dövüşçü güncellenecek...")
        
        updated_fighters = []
        for idx, fighter in enumerate(old_data, 1):
            print(f"Güncelleniyor ({idx}/{len(old_data)}): {fighter['Fighter']}")
            
            # Dövüşçüyü UFC Stats'ta ara
            search_url = f"{self.fighters_url}?query={fighter['Fighter'].replace(' ', '+')}"
            # ... burada arama ve güncelleme mantığı
            
            time.sleep(1)
        
        return updated_fighters
    
    
import json

def is_ufc_event(event_name):
    """
    Sadece UFC ana etkinlikleri filtrele
    """
    if not event_name:
        return False
    event_name = event_name.lower()
    # Sadece UFC ana kart / Fight Night / PPV
    return ('ufc' in event_name) and ('dwcs' not in event_name) and ('the ultimate fighter' not in event_name) and ('pride' not in event_name)

def merge_fighters_data(old_file, new_data, output_file='fighters_updated.json'):
    """
    Mevcut fighters.json dosyasını yeni scrape edilen verilerle birleştirir.
    - Picture key'i korunur
    - Eski JSON'daki eksik key'ler scraper'dan yoksa eklenir
    """
    
    with open(old_file, 'r', encoding='utf-8') as f:
        old_fighters = json.load(f)
    
    old_fighters_dict = {f['Fighter']: f for f in old_fighters}
    merged_fighters = []
    
    for fighter in new_data:
        name = fighter.get('Fighter')
        if not name:
            continue
        
        if name in old_fighters_dict:
            merged = old_fighters_dict[name].copy()
            for k, v in fighter.items():
                if k == 'Picture':
                    continue  # Mevcut resim değerini koru
                merged[k] = v
            
            # Eksik key'leri eski JSON'dan al
            for k_old, v_old in old_fighters_dict[name].items():
                if k_old not in merged:
                    merged[k_old] = v_old
            
            merged_fighters.append(merged)
            del old_fighters_dict[name]
        else:
            merged_fighters.append(fighter)
    
    # Sadece eski JSON’da olup yeni veride olmayan dövüşçüler
    for remaining in old_fighters_dict.values():
        merged_fighters.append(remaining)
    
    # ID sıralaması
    for idx, f in enumerate(merged_fighters, 1):
        f['Id'] = idx
    
    # JSON olarak kaydet
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_fighters, f, indent=4, ensure_ascii=False)
    
    print(f"Birleştirilmiş {len(merged_fighters)} dövüşçü kaydedildi: {output_file}")
    return merged_fighters



# KULLANIM ÖRNEKLERİ:
if __name__ == "__main__":
    scraper = UFCStatsScraper()
    
    # Seçenek 1: Tüm dövüşçüleri scrape et (uzun sürer!)
    # all_fighters = scraper.scrape_all_fighters()
    # scraper.save_to_json(all_fighters)
    
    # Seçenek 2: İlk 10 dövüşçüyü test et
    #test_fighters = scraper.scrape_all_fighters(limit=10)
    # scraper.save_to_json(test_fighters, 'test_fighters.json')
    
    # Seçenek 3: Tek bir dövüşçüyı test et
    # test_url = "http://ufcstats.com/fighter-details/029eaff01e6bb8f0"
    # fighter = scraper.parse_fighter_details(test_url)
    # print(json.dumps(fighter, indent=2))


    new_fighters = scraper.scrape_all_fighters()  # Örnek: test için 10 fighter
    merged = merge_fighters_data('fighters.json', new_fighters, 'fighters_updated.json')