import fighters from "../assets/data/fighters.json";
import usaFlag from "../assets/usa_flag.png";
import nigeriaFlag from "../assets/nigeria_flag.jpg";
import russiaFlag from "../assets/russia_flag.jpg";
import polandFlag from "../assets/poland_flag.jpg";
import australiaFlag from "../assets/austraila_flag.png";
import brazilFlag from "../assets/brazil_flag.png";
import orthodoxStance from "../assets/orthodox.png";
import southpawStance from "../assets/southpaw.png";
import switchStance from "../assets/southpaw.png";
import undefeated from "../assets/undefeated.png";
import title from "../assets/title.png";

import { Fighter, Filter, FilterDifficulty } from '../interfaces/Fighter';
const Filters = (): FilterDifficulty => {
    let filters_easy: Filter[] = [{
        "id": 1,
        "filter_image": brazilFlag,
        "filter_text": "Brazilian",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "Brazil";
        })
    }, {
        "id": 2,
        "filter_image": undefeated,
        "filter_text": "Undefeated",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Losses == "0";
        })
    }, {
        "id": 3,
        "filter_image": title,
        "filter_text": "Been in Title Fight",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.BeenInTitleFight == "True";
        })
    }, {
        "id": 4,
        "filter_image": null,
        "filter_text": "Welterweight",
        "filter_no_image_text": "170",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(170);
        })
    }, {
        "id": 5,
        "filter_image": null,
        "filter_text": "Middleweight",
        "filter_no_image_text": "185",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(185);
        })
    }, {
        "id": 6,
        "filter_image": null,
        "filter_text": "Lightweight",
        "filter_no_image_text": "155",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(155);
        })
    }, {
        "id": 7,
        "filter_image": null,
        "filter_text": "Light heavyweight",
        "filter_no_image_text": "205",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(205);
        })
    }, {
        "id": 8,
        "filter_image": null,
        "filter_text": "Heavyweight",
        "filter_no_image_text": "205>",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .some((weight: any): any => weight > 205);
        })
    }, {
        "id": 9,
        "filter_image": null,
        "filter_text": "Featherweight",
        "filter_no_image_text": "145",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(145);
        })
    }, {
        "id": 10,
        "filter_image": null,
        "filter_text": "Bantamweight",
        "filter_no_image_text": "135",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(135);
        })
    }, {
        "id": 11,
        "filter_image": null,
        "filter_text": "Flyweight",
        "filter_no_image_text": "125",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(125);
        })
    }, {
        "id": 12,
        "filter_image": usaFlag,
        "filter_text": "USA",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "United States";
        })
    },
    {
        "id": 13,
        "filter_image": null,
        "filter_text": "Rounds Fought",
        "filter_no_image_text": ">20",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return parseFloat(fighter.totalRoundsFought) > 20;
        })
    },
    {
        "id": 14,
        "filter_image": null,
        "filter_text": "Octagon Debut",
        "filter_no_image_text": "2018<",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return parseInt(fighter.OctagonDebut) < 2018;
        })
    }];
    let filters_medium: Filter[] = [{
        "id": 1,
        "filter_image": brazilFlag,
        "filter_text": "Brazilian",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "Brazil";
        })
    }, {
        "id": 2,
        "filter_image": undefeated,
        "filter_text": "Undefeated",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Losses == "0";
        })
    }, {
        "id": 3,
        "filter_image": title,
        "filter_text": "Been in Title Fight",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.BeenInTitleFight == "True";
        })
    }, {
        "id": 4,
        "filter_image": null,
        "filter_text": "Welterweight",
        "filter_no_image_text": "170",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(170);
        })
    }, {
        "id": 5,
        "filter_image": null,
        "filter_text": "Middleweight",
        "filter_no_image_text": "185",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(185);
        })
    }, {
        "id": 6,
        "filter_image": null,
        "filter_text": "Lightweight",
        "filter_no_image_text": "155",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(155);
        })
    }, {
        "id": 7,
        "filter_image": null,
        "filter_text": "Light heavyweight",
        "filter_no_image_text": "205",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(205);
        })
    }, {
        "id": 8,
        "filter_image": null,
        "filter_text": "Heavyweight",
        "filter_no_image_text": "205>",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .some((weight: any): any => weight > 205);
        })
    }, {
        "id": 9,
        "filter_image": null,
        "filter_text": "Featherweight",
        "filter_no_image_text": "145",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(145);
        })
    }, {
        "id": 10,
        "filter_image": null,
        "filter_text": "Bantamweight",
        "filter_no_image_text": "135",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(135);
        })
    }, {
        "id": 11,
        "filter_image": null,
        "filter_text": "Flyweight",
        "filter_no_image_text": "125",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.WeightLbs.split(", ")
                .map(Number)
                .includes(125);
        })
    }, {
        "id": 12,
        "filter_image": usaFlag,
        "filter_text": "USA",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "United States";
        })
    }, {
        "id": 13,
        "filter_image": polandFlag,
        "filter_text": "Poland",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "Poland";
        })
    }, {
        "id": 14,
        "filter_image": nigeriaFlag,
        "filter_text": "Nigeria",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "Nigeria";
        })
    }, {
        "id": 15,
        "filter_image": australiaFlag,
        "filter_text": "Australia",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "Australia";
        })
    },
    {
        "id": 16,
        "filter_image": russiaFlag,
        "filter_text": "Russia",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "Russia";
        })
    }, {
        "id": 17,
        "filter_image": null,
        "filter_text": "Octagon Debut",
        "filter_no_image_text": "2015>",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return parseInt(fighter.OctagonDebut) > 2015;
        })
    },
    {
        "id": 18,
        "filter_image": null,
        "filter_text": "Total Title Bouts",
        "filter_no_image_text": ">2",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return parseInt(fighter.TotalTitleBouts) > 2;
        })
    },
    {
        "id": 19,
        "filter_image": null,
        "filter_text": "Height",
        "filter_no_image_text": ">180",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return parseFloat(fighter.HeightCms) > 180;
        })
    },
    {
        "id": 20,
        "filter_image": null,
        "filter_text": "Rounds Fought",
        "filter_no_image_text": ">20",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return parseFloat(fighter.totalRoundsFought) > 20;
        })
    }, {
        "id": 21,
        "filter_image": null,
        "filter_text": "Age",
        "filter_no_image_text": "35>",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return parseInt(fighter.Age) > 35;
        })
    }, {
        "id": 22,
        "filter_image": null,
        "filter_text": "Age",
        "filter_no_image_text": "30<",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return parseInt(fighter.Age) < 30;
        })
    },
    {
        "id": 23,
        "filter_image": null,
        "filter_text": "Octagon Debut",
        "filter_no_image_text": "2015<",
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return parseInt(fighter.OctagonDebut) < 2015;
        })
    }];
    let filters_hard: Filter[] = [
        {
            "id": 1,
            "filter_image": brazilFlag,
            "filter_text": "Brazilian",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Nationality == "Brazil";
            })
        }, {
            "id": 2,
            "filter_image": undefeated,
            "filter_text": "Undefeated",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Losses == "0";
            })
        }, {
            "id": 3,
            "filter_image": title,
            "filter_text": "Been in Title Fight",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.BeenInTitleFight == "True";
            })
        }, {
            "id": 4,
            "filter_image": null,
            "filter_text": "Welterweight",
            "filter_no_image_text": "170",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.WeightLbs.split(", ")
                    .map(Number)
                    .includes(170);
            })
        }, {
            "id": 5,
            "filter_image": null,
            "filter_text": "Middleweight",
            "filter_no_image_text": "185",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.WeightLbs.split(", ")
                    .map(Number)
                    .includes(185);
            })
        }, {
            "id": 6,
            "filter_image": null,
            "filter_text": "Lightweight",
            "filter_no_image_text": "155",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.WeightLbs.split(", ")
                    .map(Number)
                    .includes(155);
            })
        }, {
            "id": 7,
            "filter_image": null,
            "filter_text": "Light heavyweight",
            "filter_no_image_text": "205",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.WeightLbs.split(", ")
                    .map(Number)
                    .includes(205);
            })
        }, {
            "id": 8,
            "filter_image": null,
            "filter_text": "Heavyweight",
            "filter_no_image_text": "205>",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.WeightLbs.split(", ")
                    .map(Number)
                    .some((weight: any): any => weight > 205);
            })
        }, {
            "id": 9,
            "filter_image": null,
            "filter_text": "Featherweight",
            "filter_no_image_text": "145",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.WeightLbs.split(", ")
                    .map(Number)
                    .includes(145);
            })
        }, {
            "id": 10,
            "filter_image": null,
            "filter_text": "Bantamweight",
            "filter_no_image_text": "135",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.WeightLbs.split(", ")
                    .map(Number)
                    .includes(135);
            })
        }, {
            "id": 11,
            "filter_image": null,
            "filter_text": "Flyweight",
            "filter_no_image_text": "125",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.WeightLbs.split(", ")
                    .map(Number)
                    .includes(125);
            })
        }, {
            "id": 12,
            "filter_image": usaFlag,
            "filter_text": "USA",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Nationality == "United States";
            })
        }, {
            "id": 13,
            "filter_image": polandFlag,
            "filter_text": "Poland",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Nationality == "Poland";
            })
        }, {
            "id": 14,
            "filter_image": nigeriaFlag,
            "filter_text": "Nigeria",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Nationality == "Nigeria";
            })
        }, {
            "id": 15,
            "filter_image": australiaFlag,
            "filter_text": "Australia",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Nationality == "Australia";
            })
        },
        {
            "id": 16,
            "filter_image": russiaFlag,
            "filter_text": "Russia",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Nationality == "Russia";
            })
        }, {
            "id": 17,
            "filter_image": null,
            "filter_text": "Octagon Debut",
            "filter_no_image_text": "2015>",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return parseInt(fighter.OctagonDebut) > 2015;
            })
        },
        {
            "id": 18,
            "filter_image": orthodoxStance,
            "filter_text": "Orthodox",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Stance == "Orthodox" || fighter.Stance == "Switch";
            })
        }, {
            "id": 19,
            "filter_image": switchStance,
            "filter_text": "Switch",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Stance == "Switch";
            })
        }, {
            "id": 20,
            "filter_image": southpawStance,
            "filter_text": "Southpaw",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Stance == "Orthodox" || fighter.Stance == "Switch";
            })
        },
        {
            "id": 21,
            "filter_image": null,
            "filter_text": "Total Title Bouts",
            "filter_no_image_text": ">2",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return parseInt(fighter.TotalTitleBouts) > 2;
            })
        },
        {
            "id": 22,
            "filter_image": null,
            "filter_text": "Height",
            "filter_no_image_text": ">180",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return parseFloat(fighter.HeightCms) > 180;
            })
        },
        {
            "id": 23,
            "filter_image": null,
            "filter_text": "Rounds Fought",
            "filter_no_image_text": ">20",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return parseFloat(fighter.totalRoundsFought) > 20;
            })
        },
        {
            "id": 24,
            "filter_image": null,
            "filter_text": "Octagon Debut",
            "filter_no_image_text": "2014<",
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return parseInt(fighter.OctagonDebut) < 2014;
            })
        }
    ];
    return { easy: filters_easy, medium: filters_medium, hard: filters_hard };
}

export default Filters;