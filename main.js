const statBlockClassName = "mon-stat-block";

const removeEmpty = (obj) => {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
};

const getName = (statBlockElement) => {
    return statBlockElement.getElementsByClassName("mon-stat-block__name-link")[0]?.textContent.trim() || undefined;
}

const getAttributeValue = (statBlockElement, attributeName) => {
    const label = [...statBlockElement.getElementsByClassName("mon-stat-block__attribute-label")].filter(x => x.textContent === attributeName)[0];
    return label?.parentElement.getElementsByClassName("mon-stat-block__attribute-data-value")[0]?.textContent.trim() || undefined;
}

const getAttributeExtra = (statBlockElement, attributeName) => {
    const label = [...statBlockElement.getElementsByClassName("mon-stat-block__attribute-label")].filter(x => x.textContent === attributeName)[0];
    return label?.parentElement.getElementsByClassName("mon-stat-block__attribute-data-extra")[0]?.textContent.trim() || undefined;
}

const getAbilityScore = (statBlockElement, abilityAbbr) => {
    const label = [...statBlockElement.getElementsByClassName("ability-block__heading")].filter(x => x.textContent === abilityAbbr)[0];
    const scoreString = label?.parentElement.getElementsByClassName("ability-block__score")[0]?.textContent.trim()
    return scoreString ? parseInt(scoreString) : undefined;
}

const getAbilityModifier = (statBlockElement, abilityAbbr) => {
    const label = [...statBlockElement.getElementsByClassName("ability-block__heading")].filter(x => x.textContent === abilityAbbr)[0];
    return label?.parentElement.getElementsByClassName("ability-block__modifier")[0]?.textContent.trim() || undefined;
}

const getTidbit = (statBlockElement, tidbitName) => {
    const label = [...statBlockElement.getElementsByClassName("mon-stat-block__tidbit-label")].filter(x => x.textContent === tidbitName)[0];
    return label?.parentElement.getElementsByClassName("mon-stat-block__tidbit-data")[0]?.textContent.trim() || undefined;
}

const hasStrongChild = (element) => {
    return element.getElementsByTag("strong").length > 0;
}

const getAbility = (element) => {
    if (element.getElementsByTagName("strong").length > 0) {
        const dividerIndex = element.textContent.indexOf(".");
        return {
            name: element.textContent.substring(0, dividerIndex),
            description: element.textContent.substring(dividerIndex + 1).trim(),
        }
    } else {
        return {
            name: null,
            description: element.textContent.trim(),
        };
    }
}

const getAbilities = (statBlockElement, descriptionBlockIndex) => {
    const container = statBlockElement
        .getElementsByClassName("mon-stat-block__description-block")[descriptionBlockIndex]
        ?.getElementsByClassName("mon-stat-block__description-block-content")[0];

    if (!container) return undefined;

    let currentAbility = null;
    const abilities = [];

    const processAbility = (element) => {
        const newAbility = getAbility(element);
        if (newAbility.name) {
            if (currentAbility) {
                abilities.push(currentAbility);
            }
            currentAbility = newAbility;
        } else if (currentAbility != null) {
            currentAbility.description += "\n" + newAbility.description;
        } else {
            currentAbility = newAbility;
        }
    }

    for (const traitElement of container.children)
    {
        if (["ol", "ul"].includes(traitElement.tagName.toLowerCase())) {
            for (const listElement of traitElement.children) {
                processAbility(listElement);
            }
        } else {
            processAbility(traitElement);
        }
    }

    if (currentAbility != null) {
        abilities.push(currentAbility);
    }
    return abilities;
}

const getTraits = (statBlockElement) => getAbilities(statBlockElement, 0);
const getActions = (statBlockElement) => getAbilities(statBlockElement, 1);
const getLegendaryActions = (statBlockElement) => getAbilities(statBlockElement, 2);

const parseBonuses = (bonusesString) => {
    if (!bonusesString) return undefined;
    const bonuses = [];
    for (const bonus of bonusesString.split(", "))
    {
        const parts = bonus.split(" ");
        bonuses.push({ name: parts[0], modifier: parts[1] });
    }
    if (bonuses.length === 0) return undefined;
    return bonuses;
}

const parseJsonFromStatBlock = (statBlockElement) => {
    const crString = getTidbit(statBlockElement, "Challenge");
    const cr = crString.slice(0, crString.indexOf(" "));
    const crXp = crString.slice(crString.indexOf(" ") + 1);
    const statBlock = {
        name: getName(statBlockElement),
        hp: parseInt(getAttributeValue(statBlockElement, "Hit Points")),
        hitDice: getAttributeExtra(statBlockElement, "Hit Points"),
        ac: parseInt(getAttributeValue(statBlockElement, "Armor Class")),
        acDescription: getAttributeExtra(statBlockElement, "Armor Class"),
        speed: getAttributeValue(statBlockElement, "Speed"),
        abilityScores: {
            strength: getAbilityScore(statBlockElement, "STR"),
            strengthMod: getAbilityModifier(statBlockElement, "STR"),
            dexterity: getAbilityScore(statBlockElement, "DEX"),
            dexterityMod: getAbilityModifier(statBlockElement, "DEX"),
            constitution: getAbilityScore(statBlockElement, "CON"),
            constitutionMod: getAbilityModifier(statBlockElement, "CON"),
            intelligence: getAbilityScore(statBlockElement, "INT"),
            intelligenceMod: getAbilityModifier(statBlockElement, "INT"),
            wisdom: getAbilityScore(statBlockElement, "WIS"),
            wisdomMod: getAbilityModifier(statBlockElement, "WIS"),
            charisma: getAbilityScore(statBlockElement, "CHA"),
            charismaMod: getAbilityModifier(statBlockElement, "CHA"),
        },
        savingThrows: parseBonuses(getTidbit(statBlockElement, "Saving Throws")),
        skills: parseBonuses(getTidbit(statBlockElement, "Skills")),
        senses: getTidbit(statBlockElement, "Senses"),
        languages: getTidbit(statBlockElement, "Languages"),
        damageVulnerabilities: getTidbit(statBlockElement, "Damage Vulnerabilities"),
        damageResistances: getTidbit(statBlockElement, "Damage Resistances"),
        damageImmunities: getTidbit(statBlockElement, "Damage Immunities"),
        conditionImmunities: getTidbit(statBlockElement, "Condition Immunities"),
        cr: cr,
        crXp: crXp,
        proficiencyBonus: getTidbit(statBlockElement, "Proficiency Bonus"),
        traits: getTraits(statBlockElement),
        actions: getActions(statBlockElement),
        legendaryActions: getLegendaryActions(statBlockElement),
    };
    removeEmpty(statBlock);
    return statBlock;
}

const formatLongYamlString = (str) => `"${str.replace(/(\r\n|\r|\n)/g, "\\n")}"`;

const buildYamlFromJson = (statBlock) => {
    let yamlString = "";
    if (statBlock.name) yamlString += `name: ${statBlock.name}\n`;
    if (statBlock.hp) yamlString += `hp: ${statBlock.hp}\n`;
    if (statBlock.hitDice) yamlString += `hit_dice: ${statBlock.hitDice.slice(1, statBlock.hitDice.length - 2)}\n`;
    if (statBlock.ac) yamlString += `ac: ${statBlock.ac}\n`;
    if (statBlock.acDescription) yamlString += `ac_description: ${statBlock.acDescription}\n`;
    if (statBlock.speed) yamlString += `speed: ${statBlock.speed}\n`;
    if (statBlock.abilityScores) yamlString += `stats: [${statBlock.abilityScores.strength}, ${statBlock.abilityScores.dexterity}, ${statBlock.abilityScores.constitution}, ${statBlock.abilityScores.intelligence}, ${statBlock.abilityScores.wisdom}, ${statBlock.abilityScores.charisma}]\n`;
    if ((statBlock.savingThrows?.length || 0) > 0) {
        yamlString += `saves:\n`;
        for (const save of statBlock.savingThrows) {
            yamlString += `  - ${save.name}: ${save.modifier}\n`;
        }
    }
    if ((statBlock.skills?.length || 0) > 0) {
        yamlString += `skillsaves:\n`;
        for (const skill of statBlock.skills) {
            yamlString += `  - ${skill.name}: ${skill.modifier}\n`;
        }
    }
    if (statBlock.senses) yamlString += `senses: ${statBlock.senses}\n`;
    if (statBlock.languages) yamlString += `languages: ${statBlock.languages}\n`;
    if (statBlock.damageVulnerabilities) yamlString += `damage_vulnerabilities: ${statBlock.damageVulnerabilities}\n`;
    if (statBlock.damageResistances) yamlString += `damage_resistances: ${statBlock.damageResistances}\n`;
    if (statBlock.damageImmunities) yamlString += `damage_immunities: ${statBlock.damageImmunities}\n`;
    if (statBlock.conditionImmunities) yamlString += `condition_immunities: ${statBlock.conditionImmunities}\n`;
    if (statBlock.cr) yamlString += `cr: ${statBlock.cr}\n`;

    if ((statBlock.traits?.length || 0) > 0) {
        yamlString += `traits:\n`;
        for (const trait of statBlock.traits) {
            yamlString += `  - name: ${trait.name}\n`
            yamlString += `    desc: ${formatLongYamlString(trait.description)}\n`
        }
    }

    if ((statBlock.actions?.length || 0) > 0) {
        yamlString += `actions:\n`;
        for (const action of statBlock.actions) {
            yamlString += `  - name: ${action.name}\n`
            yamlString += `    desc: ${formatLongYamlString(action.description)}\n`
        }
    }

    if ((statBlock.legendaryActions?.length || 0) > 0) {
        yamlString += `legendary_actions:\n`;
        for (const action of statBlock.legendaryActions) {
            yamlString += `  - name: ${action.name}\n`
            yamlString += `    desc: ${formatLongYamlString(action.description)}\n`
        }
    }

    return yamlString;
}

const addButtonToStatBlock = (statBlockElement) =>
{
    const yamlButton = document.createElement("button");
    yamlButton.textContent = "Copy YAML";
    yamlButton.onclick = () => {
        const json = parseJsonFromStatBlock(statBlockElement);
        const yaml = buildYamlFromJson(json);
        navigator.clipboard.writeText(yaml);
    }
    statBlockElement.parentElement.insertBefore(yamlButton, statBlockElement.nextSibling)

    const jsonButton = document.createElement("button");
    jsonButton.textContent = "Copy JSON";
    jsonButton.onclick = () => {
        const json = parseJsonFromStatBlock(statBlockElement);
        console.log(json);
        navigator.clipboard.writeText(JSON.stringify(json));
    }
    statBlockElement.parentElement.insertBefore(jsonButton, statBlockElement.nextSibling)
}

const observer = new MutationObserver(mutations => {
    const statBlockElements = [];
    for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
            if (!addedNode.tagName) continue; // not a DOM element
            if (addedNode.classList.contains(statBlockClassName)) {
                statBlockElements.push(addedNode);
            } else if (addedNode.firstElementChild) {
                statBlockElements.push(...addedNode.getElementsByClassName(statBlockClassName));
            }
        }
    }
    statBlockElements.forEach(addButtonToStatBlock);
});
observer.observe(document, { childList: true, subtree: true });

[...document.getElementsByClassName(statBlockClassName)].forEach(addButtonToStatBlock);