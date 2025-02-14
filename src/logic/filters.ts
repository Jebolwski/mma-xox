import React from 'react'
import fighters_url from "../assets/data/fighters_url.json";
import { Fighter } from '../interfaces/Fighter';
const Filters = () => {
    let filters_all = [
        {
            "id": 1,
            "filter_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Brazilian_flag_icon_square.svg/640px-Brazilian_flag_icon_square.svg.png",
            "filter_text": "Brazilian",
            "filter_no_image_text": null,
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.Nationality == "Brazil";
            })
        }, {
            "id": 2,
            "filter_image": "https://clipart-library.com/images/6cyoELkei.png",
            "filter_text": "Undefeated",
            "filter_no_image_text": null,
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.Losses == "0";
            })
        }, {
            "id": 3,
            "filter_image": "https://pngimg.com/d/ufc_PNG66.png",
            "filter_text": "Been in Title Fight",
            "filter_no_image_text": null,
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.BeenInTitleFight == "True";
            })
        }, {
            "id": 4,
            "filter_image": null,
            "filter_text": "Welterweight",
            "filter_no_image_text": "170",
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.Division == "Welterweight";
            })
        }, {
            "id": 5,
            "filter_image": null,
            "filter_text": "Middleweight",
            "filter_no_image_text": "185",
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.Division == "Middleweight";
            })
        }, {
            "id": 6,
            "filter_image": null,
            "filter_text": "Lightweight",
            "filter_no_image_text": "155",
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.Division == "Lightweight";
            })
        }, {
            "id": 7,
            "filter_image": null,
            "filter_text": "Light heavyweight",
            "filter_no_image_text": "205",
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.Division == "Light heavyweight";
            })
        }, {
            "id": 8,
            "filter_image": null,
            "filter_text": "Heavyweight",
            "filter_no_image_text": "205>",
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.Division == "Heavyweight";
            })
        }, {
            "id": 9,
            "filter_image": null,
            "filter_text": "Featherweight",
            "filter_no_image_text": "145",
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.Division == "Featherweight";
            })
        }, {
            "id": 10,
            "filter_image": null,
            "filter_text": "Bantamweight",
            "filter_no_image_text": "135",
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.Division == "Bantamweight";
            })
        }, {
            "id": 11,
            "filter_image": null,
            "filter_text": "Flyweight",
            "filter_no_image_text": "125",
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.Division == "Flyweight";
            })
        }, {
            "id": 12,
            "filter_image": "https://vectorflags.s3.amazonaws.com/flags/us-square-01.png",
            "filter_text": "USA",
            "filter_no_image_text": "125",
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.Nationality == "United States";
            })
        }, {
            "id": 13,
            "filter_image": "https://pngimg.com/d/ufc_PNG66.png",
            "filter_text": "Total Title Bouts",
            "filter_no_image_text": ">2",
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return parseInt(fighter.TotalTitleBouts) > 2;
            })
        }, {
            "id": 14,
            "filter_image": "https://static.vecteezy.com/system/resources/previews/004/711/931/non_2x/russia-square-national-flag-vector.jpg",
            "filter_text": "Russian",
            "filter_no_image_text": null,
            "filter_fighters": fighters_url.filter((fighter: Fighter) => {
                return fighter.Nationality == "Russia";
            })
        }]
    return filters_all;
}

export default Filters