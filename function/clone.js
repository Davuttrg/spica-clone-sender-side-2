/*


What can this do ?
    * Send your buckets schemas with same _id between to your new spica servers
    * Send your functions with dependencies and environments to your spica servers

The process of this asset works as follows: Suppose the main server is A and B's cloning server. You must download this asset to sender side

        Body 
            {
                server_name -> Required! Your functions, dependencies of functions and buckets schemas will send to B
                (accepted : server_name for example "test-a1b2c")
            }
            
You must raise the function maximum timeout up to 300 seconds from the Hq dashboard panel (advance settings)

*/

import Bucket from "@spica-devkit/bucket";
const fetch = require("node-fetch");

export async function sender(req, res) {
  const { server_name } = req.query;

  Bucket.initialize({ apikey: `${process.env.API_KEY}` });
  const HOST = server_name;

  /////////--------------Get Schemas-----------------////////////
  let schemas = await Bucket.getAll().catch((error) =>
    console.log("get all buckets error :", error)
  );
  /////////--------------Get Schemas-----------------////////////

  /////////--------------Get Functions with dependencies and environments-----------------////////////
  let allFunctions = await getAllFunctions(HOST).catch((error) =>
    console.log("get allfunctions error :", error)
  );

  let isIgnore = false;
  let willSpliceIndex;
  for (let [index, fn] of allFunctions.entries()) {
    isIgnore = false;
    Object.keys(fn.env).forEach((e) => {
      if (e == "_IGNORE_") {
        isIgnore = true;
        willSpliceIndex = index;
        return;
      }
    });
    if (!isIgnore) {
      await getIndexes(fn._id, HOST)
        .then((index) => {
          fn.index = index;
        })
        .catch((error) => console.log("getIndexes error :", error));
      await getDependencies(fn._id, HOST)
        .then((dependency) => {
          fn.dependencies = dependency;
        })
        .catch((error) => console.log("getDependencies error :", error));
    }
  }
  allFunctions.splice(willSpliceIndex, 1);
  /////////--------------Get Functions with dependencies and environments-----------------////////////

  return {
    data: {
      schemas: schemas,
      allFunctions: allFunctions,
      spesificSchema: false,
      env: true,
    }
  }

}

async function getAllFunctions(HOST) {
  return new Promise(async (resolve, reject) => {
    await fetch(`https://${HOST}.hq.spicaengine.com/api/function/`, {
      headers: {
        Authorization: `APIKEY ${process.env.API_KEY}`,
      },
    })
      .then((res) => res.json())
      .then(async (json) => {
        resolve(json);
      })
      .catch((error) => {
        reject(error);
        console.log("error : ", error);
      });
  });
}

async function getIndexes(id, HOST) {
  return new Promise(async (resolve, reject) => {
    await fetch(`https://${HOST}.hq.spicaengine.com/api/function/${id}/index`, {
      headers: {
        Authorization: `APIKEY ${process.env.API_KEY}`,
      },
    })
      .then((res) => res.json())
      .then(async (json) => {
        resolve(json);
      })
      .catch((error) => {
        reject(error);
        console.log("error : ", error);
      });
  });
}

async function getDependencies(id, HOST) {
  return new Promise(async (resolve, reject) => {
    await fetch(`https://${HOST}.hq.spicaengine.com/api/function/${id}/dependencies`, {
      headers: {
        Authorization: `APIKEY ${process.env.API_KEY}`,
      },
    })
      .then((res) => res.json())
      .then(async (json) => {
        resolve(json);
      })
      .catch((error) => {
        reject(error);
        console.log("error : ", error);
      });
  });
}
