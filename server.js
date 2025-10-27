import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import {
  employees, states, countries, cities,emailRoutes,
  departments, companies, branches, users, pages, roles, subscriptions, finYear,
  employeeCategories, pageGroup,
  party,
  partyCategories,
  productBrand,
  productCategory,
  productSubCategory,
  product,
  stock,
  salesBill,
  purchaseReturn,
  salesReturn,
  uom, quotes, lead,
  project, invoice, projectPayment, orderImport, sample,
  color, fabricType, yarnBlend, yarn, yarnType, fabric, panel, processMaster, size, style, item, itemType, order,
  cuttingOrder, styleType, classMaster, po, taxTemplate, taxTerm, dia, gsm, accessory, accessoryItem, accessoryGroup, payTerm, looplength,
  design, gauge, termsAndCondition, location, directInwardOrReturn, directCancelOrReturn, purchaseCancel, cuttingDelivery, cuttingReceipt, lossReason,
  processDelivery, productionDelivery, productionReceipt,
  dispatched, generalPurchase, rawMaterialOpeningStock,
  contentMaster,
  counts,
  Machine, socksMaterial,
  currency, socksType, measurement, fibercontent,
  yarnNeedle,certificate,
  
  partyBranch,
  partyBranchContact,
  partyContact,
  branchType,
  requirementPlanningForm,
  Material,
  raiseIndent,
  materialIssue,
  stockTransfer,
  excessTolerance,
  accessoryPo,
  accesssoryPurchaseCancel,
  accessoryPurchaseInward,
  
  terms$conditions,
  hsn,
  billEntry,
  accessoryReturn,
} from './src/routes/index.js';

import { socketMain } from './src/sockets/socket.js';

const app = express()
// app.use(express.json())
app.use(express.json({ limit: "50mb" }))


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.use(cors())

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json())

const path = __dirname + '/client/build/';

app.use(express.static(path));


app.get('/', function (req, res) {
  res.sendFile(path + "index.html");
});

BigInt.prototype['toJSON'] = function () {
  return parseInt(this.toString());
};


app.use("/employees", employees);
app.use("/countries", countries);
app.use("/certificate", certificate)
app.use("/states", states);
app.use("/cities", cities);
app.use("/departments", departments);
app.use("/companies", companies);
app.use("/branches", branches);
app.use("/users", users);
app.use("/pages", pages);
app.use("/pageGroup", pageGroup);
app.use("/roles", roles);
app.use("/subscriptions", subscriptions);
app.use("/finYear", finYear);
app.use("/employeeCategories", employeeCategories);
app.use("/partyCategories", partyCategories);
app.use("/party", party);
app.use("/productBrand", productBrand);
app.use("/socksMaterial", socksMaterial)
app.use("/productCategory", productCategory);
app.use("/productSubCategory", productSubCategory);
app.use("/product", product);
app.use("/stock", stock);
app.use("/salesBill", salesBill);
app.use("/purchaseReturn", purchaseReturn)
app.use("/salesReturn", salesReturn)
app.use('/uom', uom),
app.use('/quotes', quotes),
app.use('/lead', lead)
app.use('/project', project),
app.use('/invoice', invoice),
app.use('/projectPayment', projectPayment),
app.use("/orderImport", orderImport);
app.use("/sample", sample);
app.use("/color", color);
app.use("/fabric", fabric);
app.use("/process", processMaster);
app.use("/panel", panel);
app.use("/yarnType", yarnType);
app.use("/yarnBlend", yarnBlend);
app.use("/yarn", yarn);
app.use("/fabricType", fabricType);
app.use('/send-email', emailRoutes);
app.use("/size", size);
app.use("/style", style);
app.use("/item", item);
app.use("/itemType", itemType);
app.use("/styleType", styleType);
app.use("/order", order);
app.use("/cuttingOrder", cuttingOrder);
app.use("/classMaster", classMaster);
app.use("/po", po);
app.use("/taxTemplate", taxTemplate);
app.use("/taxTerm", taxTerm);
app.use("/dia", dia);
app.use("/hsn", hsn);
app.use("/accessory", accessory);
app.use("/gsm", gsm);
app.use("/accessoryItem", accessoryItem);
app.use("/accessoryGroup", accessoryGroup);
app.use("/payTerm", payTerm);
app.use("/looplength", looplength);
app.use("/design", design);
app.use("/gauge", gauge);
app.use("/termsAndCondition", termsAndCondition);
app.use("/location", location);
app.use("/directInwardOrReturn", directInwardOrReturn);
app.use("/directCancelOrReturn", directCancelOrReturn);
app.use("/purchaseCancel", purchaseCancel);
app.use("/cuttingDelivery", cuttingDelivery);
app.use("/cuttingReceipt", cuttingReceipt);
app.use("/lossReason", lossReason);
app.use("/processDelivery", processDelivery);
app.use("/productionDelivery", productionDelivery);
app.use("/productionReceipt", productionReceipt);
app.use("/dispatched", dispatched);
app.use("/generalpurchase", generalPurchase);
app.use("/rawMaterialOpeningStock", rawMaterialOpeningStock);
app.use("/sizeTemplate", size);
app.use("/content", contentMaster);
app.use("/counts", counts);
app.use("/machine", Machine);
app.use("/currency", currency);
app.use("/socksType", socksType);
app.use("/measurement", measurement);
app.use("/fiberContent", fibercontent);
app.use("/fiberContent", fibercontent);
app.use("/yarnNeedle", yarnNeedle);
app.use("/partyBranch",partyBranch)
app.use("/branchType",branchType)
app.use("/partyBranchContact",partyBranchContact)
app.use("/partyContact",partyContact)
app.use("/requirementPlanningForm", requirementPlanningForm);
app.use("/material",Material)
app.use("/raiseIndenet",raiseIndent)
app.use("/materialIssue",materialIssue)
app.use("/stockTransfer",stockTransfer)
app.use("/excessTolerance",excessTolerance)
app.use("/accessoryPo",accessoryPo)
app.use("/accesssoryPurchaseCancel",accesssoryPurchaseCancel)
app.use("/accessoryPurchaseInward",accessoryPurchaseInward)
app.use("/termsconditions",terms$conditions)
app.use("/billEntry", billEntry);
app.use("/accessoryPurchaseReturn", accessoryReturn);



app.get("/retreiveFile/:fileName", (req, res) => {
  const { fileName } = req.params
  res.sendFile(__dirname + "/uploads/" + fileName);
})

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", socketMain);

const PORT = process.env.PORT || 9000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

