import { NextApiRequest, NextApiResponse } from "next";

export default function GET(req: NextApiRequest, res: NextApiResponse) {
  res.redirect("/login");
}
