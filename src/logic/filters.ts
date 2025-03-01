import fighters from "../assets/data/fighters.json";
import { Fighter, Filter, FilterDifficulty } from '../interfaces/Fighter';
const Filters = (): FilterDifficulty => {
    let filters_easy: Filter[] = [{
        "id": 1,
        "filter_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Brazilian_flag_icon_square.svg/640px-Brazilian_flag_icon_square.svg.png",
        "filter_text": "Brazilian",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "Brazil";
        })
    }, {
        "id": 2,
        "filter_image": "https://clipart-library.com/images/6cyoELkei.png",
        "filter_text": "Undefeated",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Losses == "0";
        })
    }, {
        "id": 3,
        "filter_image": "https://pngimg.com/d/ufc_PNG66.png",
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
        "filter_image": "https://vectorflags.s3.amazonaws.com/flags/us-square-01.png",
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
    }];
    let filters_medium: Filter[] = [{
        "id": 1,
        "filter_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Brazilian_flag_icon_square.svg/640px-Brazilian_flag_icon_square.svg.png",
        "filter_text": "Brazilian",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "Brazil";
        })
    }, {
        "id": 2,
        "filter_image": "https://clipart-library.com/images/6cyoELkei.png",
        "filter_text": "Undefeated",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Losses == "0";
        })
    }, {
        "id": 3,
        "filter_image": "https://pngimg.com/d/ufc_PNG66.png",
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
        "filter_image": "https://vectorflags.s3.amazonaws.com/flags/us-square-01.png",
        "filter_text": "USA",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "United States";
        })
    }, {
        "id": 13,
        "filter_image": "https://static.vecteezy.com/system/resources/previews/004/712/176/non_2x/poland-square-national-flag-vector.jpg",
        "filter_text": "Poland",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "Poland";
        })
    }, {
        "id": 14,
        "filter_image": "https://static.vecteezy.com/system/resources/previews/004/712/747/non_2x/nigeria-square-national-flag-vector.jpg",
        "filter_text": "Nigeria",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "Nigeria";
        })
    }, {
        "id": 15,
        "filter_image": "https://vectorflags.s3.amazonaws.com/flags/au-square-01.png",
        "filter_text": "Australia",
        "filter_no_image_text": null,
        "filter_fighters": fighters.filter((fighter: Fighter) => {
            return fighter.Nationality == "Australia";
        })
    },
    {
        "id": 16,
        "filter_image": "https://static.vecteezy.com/system/resources/previews/004/711/931/non_2x/russia-square-national-flag-vector.jpg",
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
    }];
    let filters_hard: Filter[] = [
        {
            "id": 1,
            "filter_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Brazilian_flag_icon_square.svg/640px-Brazilian_flag_icon_square.svg.png",
            "filter_text": "Brazilian",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Nationality == "Brazil";
            })
        }, {
            "id": 2,
            "filter_image": "https://clipart-library.com/images/6cyoELkei.png",
            "filter_text": "Undefeated",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Losses == "0";
            })
        }, {
            "id": 3,
            "filter_image": "https://pngimg.com/d/ufc_PNG66.png",
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
            "filter_image": "https://vectorflags.s3.amazonaws.com/flags/us-square-01.png",
            "filter_text": "USA",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Nationality == "United States";
            })
        }, {
            "id": 13,
            "filter_image": "https://static.vecteezy.com/system/resources/previews/004/712/176/non_2x/poland-square-national-flag-vector.jpg",
            "filter_text": "Poland",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Nationality == "Poland";
            })
        }, {
            "id": 14,
            "filter_image": "https://static.vecteezy.com/system/resources/previews/004/712/747/non_2x/nigeria-square-national-flag-vector.jpg",
            "filter_text": "Nigeria",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Nationality == "Nigeria";
            })
        }, {
            "id": 15,
            "filter_image": "https://vectorflags.s3.amazonaws.com/flags/au-square-01.png",
            "filter_text": "Australia",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Nationality == "Australia";
            })
        },
        {
            "id": 16,
            "filter_image": "https://static.vecteezy.com/system/resources/previews/004/711/931/non_2x/russia-square-national-flag-vector.jpg",
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
            "filter_image": "https://clipart-library.com/2024/gambar-karate/gambar-karate-12.png",
            "filter_text": "Orthodox",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Stance == "Orthodox" || fighter.Stance == "Switch";
            })
        }, {
            "id": 19,
            "filter_image": "https://clipart-library.com/2024/gambar-karate/gambar-karate-12.png",
            "filter_text": "Switch",
            "filter_no_image_text": null,
            "filter_fighters": fighters.filter((fighter: Fighter) => {
                return fighter.Stance == "Switch";
            })
        }, {
            "id": 20,
            "filter_image": "https://clipart-library.com/2024/gambar-karate/gambar-karate-12.png",
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
        }
    ];
    return { easy: filters_easy, medium: filters_medium, hard: filters_hard };
}

export default Filters;