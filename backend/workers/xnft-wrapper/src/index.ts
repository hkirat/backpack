const RPC = "https://api.devnet.solana.com";

//TODO: This should always point to the most recent released renderer code
const PROD_RENDERER_URL =
  "https://unpkg.com/@coral-xyz/react-xnft-dom-renderer@0.1.0-latest.2448/dist/index.js";

const NON_UPGRADED_XNFTS: string[] = [
  "De4UnwDoaRnPFpy4NXXZCvh4W7JrX5JNcxc6u9iZfZzp",
  "3i8Av28osHPoWZzWRoU29JBmfSJEcFtJhDzBTLhFG1u6",
  "9giQG6rC49ZRZVDvi9sVvrYpokYoy12iTkC3CWUtZLpS",
  "ZtANNvbEeKhfBiFakWbtMcxsYaTRgm6GEtds8PxW2bm",
  "4QaPNGJFsdqT5cbURcLcVGPQD8GgCpNM6Bmf2p88ex2f",
  "4AwaNy62XXNhgEbe3Szk9Tb7eEgDcHG3YbpEzdX8DPj5",
  "FgrUhnsbTYURx1Pyc5D2HDiPaDHzkbH3bv8aDzEmf16x",
  "HGVjbFZdHuEK1e8MAXte5hG9NquPSig5RobdLvyXvSXG",
  "8QSN1sG3nWYcTMsCP8BNgjZHdGtvxLU5cbx81KxRrLZq",
  "9AmGmRkSQYSYAupbdKmr2et8nQkSg5bo8NAG1nmXgY6g",
  "DFiTps6Xp6hKGE2AWMYveNQ6mqA9TjFa6WJiWG9smHr6",
  "8tz5Uu7XqiV2YrutBog3VSyNAL4cA3TXdfGnJx2XPPgy",
  "dShzmjZZeBJhNFXicQKDNkB41NKfaq8jF4vVU7c18pP",
  "BZ6YRowFVJ69gQRF5nbP4F4uUxukCKS2Lvez5pP6eA75",
  "Q2H1NKe4NDqsWi8tV1tE8mrxXuGdUXUEghoyffDxhvq",
  "C6rEseVodzAebN11CHLNLZtYZf9E5XtycbBSDPmYWFb",
  "HqKfgFm7m4TujMwZ1wsRiEG8kMf5Se6mgK4Y1syQYq69",
  "AeycivvGzQgT3iEn8pTWuPcazoGSUbKaUn1tLFfmyam4",
  "9Tqzi3gb4jE3D8Ez79HUTjFfS9f9ES31NjXez6yaffd7",
];

export default {
  async fetch(request: Request): Promise<Response> {
    const { searchParams, pathname } = new URL(request.url);

    let bundle = searchParams.get("bundle");
    let v2 = searchParams.get("v2");
    //@ts-ignore
    const xnftAddress: string = searchParams.get("xnftAddress");

    if (!bundle) {
      const xnftMint = pathname.match(/^\/(\w{30,50})/)?.[1];
      if (xnftMint) {
        try {
          const res = await fetch(
            `https://metaplex-api.gootools.workers.dev/${xnftMint}?rpc=${RPC}`
          );
          const {
            name,
            description,
            properties: { bundle: _bundle },
          } = await res.json();
          bundle = _bundle;
        } catch (err) {
          return json({ error: err.message }, 500);
        }
      }
    }

    if (v2 && NON_UPGRADED_XNFTS.includes(xnftAddress)) {
      // Upgrade Warning example xnft bundle
      bundle =
        "https://xnfts-dev.s3.us-west-2.amazonaws.com/warning-xnft/index.js";
    }

    if (bundle) {
      try {
        new URL(bundle);
      } catch (err) {
        return json({ error: "bundle is not a valid url" }, 500);
      }
    } else {
      return json({ error: "bundle parameter is required" }, 404);
    }

    try {
      let innerHTML;

      if (searchParams.has("external")) {
        // TODO: add integrity hash? https://www.srihash.org
        innerHTML = `<script src="${bundle}"></script>`;
      } else {
        const res = await fetch(bundle);
        const js = await res.text();
        // TODO: see if possible to check if valid JS without executing it,
        //       because `new Function(js);` is not possible on a worker
        innerHTML = `
        <!-- code loaded from ${bundle} -->
        <script>${js}</script>`;
      }

      if (v2) {
        innerHTML += `<script src="${PROD_RENDERER_URL}"></script>`;
      }

      return html(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
          </head>
          <body>
            <div id="container"></div>
            ${innerHTML}
           </body>
        </html>
      `);
    } catch (err) {
      return json({ error: "error creating html" }, 500);
    }
  },
};

const html = (data: string) =>
  new Response(data, {
    headers: {
      "content-type": "text/html",
    },
  });

const json = (data: any, status) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
