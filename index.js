// read a json file and return the data
const fs = require("fs");

const readFile = async (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

const writeFile = async (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

/* format

# name (type) <- (link(optional))

some text here

result

<section name=name type=type links={[link]}>
*/
const parseMarkdown = (md) => {
  const sections = {};
  let sectionID = 1;
  const lines = md.split("\n");
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("# ")) {
      const name = line.substring(2);
      const type = lines[i + 1].split("type=")[1];
      const links = JSON.parse(lines[i + 2].split("links=")[1]);

      let endOfSection;
      if (i + 3 < lines.length) {
        endOfSection = i + 3;
        while (!lines[endOfSection].startsWith("# ")) {
          endOfSection++;
        }
      } else {
        endOfSection = lines.length;
      }

      const content = lines.slice(i + 3, endOfSection).join("\n");

      if (!sections[name]) {
        sections[name] = {
          id: sectionID,
          name,
          type,
          links,
          content,
        };
        sectionID++;
      }

      result.push({
        name,
        type,
        links,
        content,
      });
    }
  }
  return {
    result,
    sections,
  };
};

const linkSections = (sections = {}) => {
  for (let section in sections) {
    const links = sections[section].links;
    sections[section].linkIds = [];
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      sections[section].linkIds.push(`id${sections[link].id}`);
    }
  }
   
  return sections;
};

const convertToHTML = (sections) => {
    const result = [];
    for (let section in sections) {
        const { name, type, linkIds, content, id } = sections[section];
        result.push(
        `<section id='id${id}' name='${name}' type='${type}' links=\{${JSON.stringify(
            linkIds
        )}\}>
        # ${name}
        \n${content}\n
        </section>`
        );
    }
    return result.join("\n");
}

const main = async () => {
  const md = await readFile("test.md");
  const parsed = parseMarkdown(md);
  // console.log(html);
  linkSections(parsed.sections);
  //console.log(sections);
    const html = convertToHTML(parsed.sections);
    console.log(html);
};

main();
