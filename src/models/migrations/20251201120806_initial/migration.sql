-- CreateTable
CREATE TABLE `Page` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NULL,
    `type` ENUM('Masters', 'Transactions', 'Reports', 'AdminAccess') NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `pageGroupId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `gstNo` VARCHAR(191) NULL,
    `panNo` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NULL,
    `contactMobile` BIGINT NOT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `accNo` VARCHAR(191) NULL,
    `branchName` VARCHAR(191) NULL,
    `ifscCode` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Company_companyId_key`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `validFrom` DATETIME(3) NOT NULL,
    `expireAt` DATETIME(3) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `maxUsers` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchName` VARCHAR(191) NOT NULL,
    `branchCode` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NULL,
    `contactMobile` BIGINT NOT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `idPrefix` VARCHAR(191) NULL,
    `idSequence` VARCHAR(191) NULL,
    `tempPrefix` VARCHAR(191) NULL,
    `tempSequence` VARCHAR(191) NULL,
    `prefixCategory` ENUM('Default', 'Specific') NULL,
    `address` VARCHAR(191) NULL,
    `gstNo` VARCHAR(191) NULL,
    `panNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserOnBranch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `defaultRole` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Role_companyId_name_key`(`companyId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoleOnPage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `pageId` INTEGER NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `create` BOOLEAN NOT NULL DEFAULT false,
    `edit` BOOLEAN NOT NULL DEFAULT false,
    `delete` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `RoleOnPage_roleId_pageId_key`(`roleId`, `pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `roleId` INTEGER NULL,
    `otp` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `employeeId` INTEGER NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `regNo` VARCHAR(191) NULL,
    `chamberNo` VARCHAR(191) NULL,
    `departmentId` INTEGER NULL,
    `joiningDate` DATETIME(3) NULL,
    `fatherName` VARCHAR(191) NULL,
    `dob` DATETIME(3) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `maritalStatus` ENUM('SINGLE', 'MARRIED', 'SEPARATED') NULL,
    `bloodGroup` ENUM('AP', 'BP', 'AN', 'BN', 'ABP', 'ABN', 'OP', 'ON') NULL,
    `panNo` VARCHAR(191) NULL,
    `consultFee` VARCHAR(191) NULL,
    `salaryPerMonth` VARCHAR(191) NULL,
    `commissionCharges` VARCHAR(191) NULL,
    `mobile` BIGINT NULL,
    `accountNo` VARCHAR(191) NULL,
    `ifscNo` VARCHAR(191) NULL,
    `branchName` VARCHAR(191) NULL,
    `degree` VARCHAR(191) NULL,
    `specialization` VARCHAR(191) NULL,
    `localAddress` VARCHAR(191) NULL,
    `localCityId` INTEGER NULL,
    `localPincode` INTEGER NULL,
    `permAddress` VARCHAR(191) NULL,
    `permCityId` INTEGER NULL,
    `permPincode` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `image` LONGBLOB NULL,
    `branchId` INTEGER NULL,
    `employeeCategoryId` INTEGER NULL,
    `permanent` BOOLEAN NULL DEFAULT false,
    `leavingReason` VARCHAR(191) NULL,
    `leavingDate` DATETIME(3) NULL,
    `canRejoin` BOOLEAN NULL DEFAULT true,
    `rejoinReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Employee_email_key`(`email`),
    UNIQUE INDEX `Employee_regNo_key`(`regNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinYear` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from` DATETIME(3) NOT NULL,
    `to` DATETIME(3) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `defaultCategory` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Country` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certificate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `State` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `gstNo` VARCHAR(191) NOT NULL,
    `countryId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `City` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `stateId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('Masters', 'Transactions', 'Reports', 'AdminAccess') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Currency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Party` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isSupplier` BOOLEAN NULL DEFAULT false,
    `isClient` BOOLEAN NULL DEFAULT false,
    `isBuyer` BOOLEAN NULL DEFAULT false,
    `name` VARCHAR(191) NOT NULL,
    `aliasName` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `displayName` VARCHAR(191) NULL,
    `address` LONGTEXT NULL,
    `landMark` VARCHAR(191) NULL,
    `cityId` INTEGER NULL,
    `pincode` INTEGER NULL,
    `email` VARCHAR(191) NULL,
    `contact` BIGINT NULL,
    `contactPersonName` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `contactPersonEmail` VARCHAR(191) NULL,
    `contactPersonNumber` INTEGER NULL,
    `alterContactNumber` INTEGER NULL,
    `website` VARCHAR(191) NULL,
    `currencyId` INTEGER NULL,
    `payTermDay` VARCHAR(191) NULL,
    `panNo` VARCHAR(191) NULL,
    `gstNo` VARCHAR(191) NULL,
    `msmeNo` VARCHAR(191) NULL,
    `cinNo` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `branchName` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `ifscCode` VARCHAR(191) NULL,
    `createdById` INTEGER NULL,
    `image` LONGBLOB NULL,
    `tinNo` VARCHAR(191) NULL,
    `cstNo` VARCHAR(191) NULL,
    `cstDate` DATE NULL,
    `faxNo` VARCHAR(191) NULL,
    `costCode` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `yarn` BOOLEAN NULL DEFAULT false,
    `fabric` BOOLEAN NULL DEFAULT false,
    `accessoryGroup` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `updatedById` INTEGER NULL,
    `priceTemplateId` INTEGER NULL,
    `isIgst` BOOLEAN NULL DEFAULT false,
    `isAcc` BOOLEAN NULL DEFAULT false,
    `isGy` BOOLEAN NULL DEFAULT false,
    `isDy` BOOLEAN NULL DEFAULT false,
    `mailId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyBranch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchName` VARCHAR(191) NULL,
    `branchAliasName` VARCHAR(191) NULL,
    `branchCode` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `branchCityId` INTEGER NULL,
    `branchLandMark` VARCHAR(191) NULL,
    `branchAddress` LONGTEXT NULL,
    `branchPincode` VARCHAR(191) NULL,
    `branchEmail` LONGTEXT NULL,
    `branchContactPerson` VARCHAR(191) NULL,
    `branchDesignation` VARCHAR(191) NULL,
    `branchDepartment` VARCHAR(191) NULL,
    `branchContact` VARCHAR(191) NULL,
    `branchWebsite` VARCHAR(191) NULL,
    `branchAccountNumber` VARCHAR(191) NULL,
    `branchBankname` VARCHAR(191) NULL,
    `branchIfscCode` VARCHAR(191) NULL,
    `branchBankBranchName` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,
    `isMainBranch` BOOLEAN NULL DEFAULT false,
    `branchTypeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BranchContactDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NULL,
    `partyId` INTEGER NULL,
    `contactPersonName` VARCHAR(191) NULL,
    `mobileNo` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `alterContactNumber` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyShippingAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyBranchId` INTEGER NULL,
    `address` LONGTEXT NULL,
    `aliasName` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyMaterials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,
    `value` INTEGER NULL,
    `isMainBranch` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyContactDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contactPersonName` VARCHAR(191) NULL,
    `mobileNo` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `Designation` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,
    `alterContactNumber` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyId` INTEGER NULL,
    `filePath` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BranchAttchments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyBranchId` INTEGER NULL,
    `filePath` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CertificateDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyId` INTEGER NOT NULL,
    `certificateId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyOnAccessoryItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyId` INTEGER NOT NULL,
    `accessoryItemId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Content` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Counts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YarnType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hsn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `tax` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YarnBlend` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Yarn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `contentId` INTEGER NULL,
    `yarnTypeId` INTEGER NULL,
    `countsId` INTEGER NULL,
    `aliasName` VARCHAR(191) NULL,
    `hsnId` INTEGER NULL,
    `taxPercent` DOUBLE NULL DEFAULT 0,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `yarnCounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `value` VARCHAR(191) NULL,
    `yarnId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `yarnTypeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YarnOnYarnBlend` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `yarnBlendId` INTEGER NULL,
    `percentage` INTEGER NULL,
    `yarnId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FabricType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fabric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aliasName` VARCHAR(191) NULL,
    `hsn` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `fabricTypeId` INTEGER NULL,
    `organic` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FabricOnYarnBlend` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `yarnBlendId` INTEGER NOT NULL,
    `percentage` INTEGER NOT NULL,
    `fabricId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `accessoryGroupId` INTEGER NULL,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Accessory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aliasName` VARCHAR(191) NOT NULL,
    `accessoryItemId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `taxPercent` DOUBLE NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Color` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `pantone` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `isGrey` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UnitOfMeasurement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `isCutting` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Po` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transType` VARCHAR(191) NULL,
    `dueDate` DATE NOT NULL,
    `supplierId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `deliveryType` ENUM('ToSelf', 'ToParty') NOT NULL,
    `deliveryPartyId` INTEGER NULL,
    `deliveryBranchId` INTEGER NULL,
    `remarks` LONGTEXT NULL,
    `orderId` INTEGER NULL,
    `requirementId` INTEGER NULL,
    `RequirementPlanningItemsId` INTEGER NULL,
    `isPurchaseCancel` BOOLEAN NULL DEFAULT false,
    `PurchaseType` VARCHAR(191) NULL,
    `poMaterial` VARCHAR(191) NULL,
    `poType` VARCHAR(191) NULL,
    `taxTemplateId` INTEGER NULL,
    `termsAndCondtion` LONGTEXT NULL,
    `isDeleted` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PoItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `noOfBags` INTEGER NULL,
    `weightPerBag` DOUBLE NULL,
    `percentage` DOUBLE NULL,
    `requiredQty` DOUBLE NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `tax` DOUBLE NULL DEFAULT 0,
    `sizeId` INTEGER NULL,
    `yarncategoryId` INTEGER NULL,
    `weight` DOUBLE NULL,
    `designId` INTEGER NULL,
    `gaugeId` INTEGER NULL,
    `loopLengthId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `poId` INTEGER NULL,
    `kDiaId` INTEGER NULL,
    `fDiaId` INTEGER NULL,
    `count` INTEGER NULL,
    `isPurchaseCancel` BOOLEAN NULL DEFAULT false,
    `requirementPlanningItemsId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `taxPercent` DOUBLE NULL,
    `hsnId` INTEGER NULL,
    `isDeleted` BOOLEAN NULL,
    `orderDetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryPo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NOT NULL,
    `dueDate` DATE NOT NULL,
    `supplierId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `discountType` ENUM('Flat', 'Percentage') NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `deliveryType` ENUM('ToSelf', 'ToParty') NOT NULL,
    `deliveryPartyId` INTEGER NULL,
    `deliveryBranchId` INTEGER NULL,
    `remarks` LONGTEXT NULL,
    `orderId` INTEGER NULL,
    `requirementId` INTEGER NULL,
    `RequirementPlanningItemsId` INTEGER NULL,
    `isPurchaseCancel` BOOLEAN NULL DEFAULT false,
    `PurchaseType` VARCHAR(191) NULL,
    `poMaterial` VARCHAR(191) NULL,
    `poType` VARCHAR(191) NULL,
    `taxTemplateId` INTEGER NULL,
    `termsAndCondtion` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryPoItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accessoryPoId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `noOfBags` INTEGER NULL,
    `weightPerBag` DOUBLE NULL,
    `percentage` DOUBLE NULL,
    `requiredQty` DOUBLE NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `tax` DOUBLE NULL DEFAULT 0,
    `weight` DOUBLE NULL,
    `isPurchaseCancel` BOOLEAN NULL DEFAULT false,
    `RequirementPlanningItemsId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `accessoryRequirementPlanningId` INTEGER NULL,
    `taxPercent` DOUBLE NULL,
    `hsnId` INTEGER NULL,
    `isDeleted` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PInwardOrReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inwardOrReturn` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer', 'GeneralInward', 'GeneralReturn', 'FromOrderTransfer', 'ToOrderTransfer', 'FromAccessoryTransferItems', 'ToAccessoryTransferItems', 'FromOrderTransferItems', 'ToOrderTransferTtems') NOT NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` LONGTEXT NULL,
    `remarks` LONGTEXT NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATE NULL,
    `poType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `storeId` INTEGER NULL,
    `docId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PoInwardReturnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pInwardOrReturnId` INTEGER NOT NULL,
    `poItemsId` INTEGER NULL,
    `weightPerBag` DOUBLE NULL,
    `noOfBags` INTEGER NULL,
    `noOfRolls` INTEGER NULL,
    `qty` DOUBLE NOT NULL,
    `lotNo` VARCHAR(191) NULL,
    `stockId` INTEGER NULL,

    UNIQUE INDEX `PoInwardReturnItems_stockId_key`(`stockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DirectInwardOrReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inwardOrReturn` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer', 'GeneralInward', 'GeneralReturn', 'FromOrderTransfer', 'ToOrderTransfer', 'FromAccessoryTransferItems', 'ToAccessoryTransferItems', 'FromOrderTransferItems', 'ToOrderTransferTtems') NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATE NULL,
    `orderId` INTEGER NULL,
    `poType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NULL,
    `supplierId` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `storeId` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `payTermId` INTEGER NULL,
    `taxTemplateId` INTEGER NULL,
    `discountType` ENUM('Flat', 'Percentage') NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` LONGTEXT NULL,
    `remarks` LONGTEXT NULL,
    `poInwardOrDirectInward` VARCHAR(191) NULL,
    `draftSave` BOOLEAN NULL DEFAULT false,
    `isDeleted` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DirectItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `price` DOUBLE NULL,
    `discountType` ENUM('Flat', 'Percentage') NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `taxPercent` DOUBLE NULL DEFAULT 0,
    `designId` INTEGER NULL,
    `gaugeId` INTEGER NULL,
    `loopLengthId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `kDiaId` INTEGER NULL,
    `fDiaId` INTEGER NULL,
    `directInwardOrReturnId` INTEGER NULL,
    `weightPerBag` DOUBLE NULL,
    `noOfBags` INTEGER NULL,
    `noOfRolls` INTEGER NULL,
    `qty` DOUBLE NULL,
    `lotNo` VARCHAR(191) NULL,
    `lotNoCommonIndex` INTEGER NULL,
    `poItemsId` INTEGER NULL,
    `alreadyInwardedQty` DOUBLE NULL,
    `alreadyReturnedQty` DOUBLE NULL,
    `balanceQty` DOUBLE NULL,
    `cancelQty` DOUBLE NULL,
    `poNo` VARCHAR(191) NULL,
    `poQty` DOUBLE NULL,
    `poId` INTEGER NULL,
    `isDeleted` BOOLEAN NULL,
    `orderDetailsId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `requirementPlanningItemsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryInward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inwardOrReturn` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer', 'GeneralInward', 'GeneralReturn', 'FromOrderTransfer', 'ToOrderTransfer', 'FromAccessoryTransferItems', 'ToAccessoryTransferItems', 'FromOrderTransferItems', 'ToOrderTransferTtems') NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATE NULL,
    `orderId` INTEGER NULL,
    `poType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NULL,
    `supplierId` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `storeId` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `payTermId` INTEGER NULL,
    `taxTemplateId` INTEGER NULL,
    `discountType` ENUM('Flat', 'Percentage') NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` LONGTEXT NULL,
    `remarks` LONGTEXT NULL,
    `poInwardOrDirectInward` VARCHAR(191) NULL,
    `draftSave` BOOLEAN NULL DEFAULT false,
    `isDeleted` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryInwardItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `AccessoryInwardId` INTEGER NULL,
    `fabricId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `price` DOUBLE NULL,
    `discountType` ENUM('Flat', 'Percentage') NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `taxPercent` DOUBLE NULL DEFAULT 0,
    `designId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `accessoryRequirementPlanningId` INTEGER NULL,
    `weightPerBag` DOUBLE NULL,
    `noOfBags` INTEGER NULL,
    `noOfRolls` INTEGER NULL,
    `qty` DOUBLE NULL,
    `lotNo` VARCHAR(191) NULL,
    `lotNoCommonIndex` INTEGER NULL,
    `poItemsId` INTEGER NULL,
    `alreadyInwardedQty` DOUBLE NULL,
    `alreadyReturnedQty` DOUBLE NULL,
    `balanceQty` DOUBLE NULL,
    `cancelQty` DOUBLE NULL,
    `poNo` VARCHAR(191) NULL,
    `poQty` DOUBLE NULL,
    `isDeleted` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `days` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `aliasName` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isPoWise` BOOLEAN NOT NULL DEFAULT false,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxTemplateDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taxTemplateId` INTEGER NOT NULL,
    `taxTermId` INTEGER NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,
    `amount` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gauge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Design` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoopLength` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gsm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `measurement` ENUM('CMS', 'INCHES', 'OPENWIDTH', 'TUBULER') NOT NULL,
    `kDia` BOOLEAN NOT NULL DEFAULT false,
    `fDia` BOOLEAN NOT NULL DEFAULT false,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Size` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `isAccessory` BOOLEAN NULL DEFAULT false,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocksMaterial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SizeTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SizeTemplateOnSize` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sizeTemplateId` INTEGER NOT NULL,
    `sizeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NULL,
    `inOrOut` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer', 'GeneralInward', 'GeneralReturn', 'FromOrderTransfer', 'ToOrderTransfer', 'FromAccessoryTransferItems', 'ToAccessoryTransferItems', 'FromOrderTransferItems', 'ToOrderTransferTtems') NULL,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `designId` INTEGER NULL,
    `gaugeId` INTEGER NULL,
    `loopLengthId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `kDiaId` INTEGER NULL,
    `fDiaId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `noOfRolls` INTEGER NULL DEFAULT 0,
    `noOfBags` INTEGER NULL DEFAULT 0,
    `storeId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `processId` INTEGER NULL,
    `lotNo` VARCHAR(191) NULL,
    `programInwardLotDetailsId` INTEGER NULL,
    `processDeliveryReturnRawMaterialDetailsId` INTEGER NULL,
    `cuttingDeliveryDetailsId` INTEGER NULL,
    `cuttingExcessFabricReturnDetailsId` INTEGER NULL,
    `rawMaterialsSalesDetailsId` INTEGER NULL,
    `rawMaterialOpeningStockItemsId` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `inwardLotDetailsId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `accessoryInwardItemsId` INTEGER NULL,
    `transactionId` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `requirementPlanningItemsId` INTEGER NULL,
    `category` VARCHAR(191) NULL,

    UNIQUE INDEX `Stock_programInwardLotDetailsId_key`(`programInwardLotDetailsId`),
    UNIQUE INDEX `Stock_processDeliveryReturnRawMaterialDetailsId_key`(`processDeliveryReturnRawMaterialDetailsId`),
    UNIQUE INDEX `Stock_cuttingDeliveryDetailsId_key`(`cuttingDeliveryDetailsId`),
    UNIQUE INDEX `Stock_cuttingExcessFabricReturnDetailsId_key`(`cuttingExcessFabricReturnDetailsId`),
    UNIQUE INDEX `Stock_rawMaterialsSalesDetailsId_key`(`rawMaterialsSalesDetailsId`),
    UNIQUE INDEX `Stock_rawMaterialOpeningStockItemsId_key`(`rawMaterialOpeningStockItemsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NULL,
    `inOrOut` ENUM('PurchaseCancel', 'PurchaseInward', 'PurchaseReturn', 'ProcessDelivery', 'ProcessInward', 'DirectInward', 'DirectReturn', 'CuttingDelivery', 'CuttingInward', 'CuttingExcessFabricReturn', 'ProcessDeliveryReturn', 'RawMaterialSales', 'RawMaterialOpeningStock', 'GeneralPo', 'OrderAgainstPo', 'MaterialIssue', 'StockTransfer', 'GeneralInward', 'GeneralReturn', 'FromOrderTransfer', 'ToOrderTransfer', 'FromAccessoryTransferItems', 'ToAccessoryTransferItems', 'FromOrderTransferItems', 'ToOrderTransferTtems') NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `noOfRolls` INTEGER NULL DEFAULT 0,
    `noOfBags` INTEGER NULL DEFAULT 0,
    `storeId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `lotNo` VARCHAR(191) NULL,
    `orderId` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `accessoryRequirementPlanningId` INTEGER NULL,
    `category` VARCHAR(191) NULL,
    `transactionId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeName` VARCHAR(191) NOT NULL,
    `locationId` INTEGER NOT NULL,
    `isFabric` BOOLEAN NOT NULL DEFAULT true,
    `isYarn` BOOLEAN NOT NULL DEFAULT true,
    `isAccessory` BOOLEAN NOT NULL DEFAULT true,
    `isGarments` BOOLEAN NOT NULL DEFAULT true,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Process` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `io` ENUM('GY_GY', 'GY_DY', 'GY_GF', 'DY_DY', 'DY_DF', 'GF_DF', 'DF_DF') NULL,
    `isCutting` BOOLEAN NULL DEFAULT false,
    `isPacking` BOOLEAN NULL DEFAULT false,
    `isPcsStage` BOOLEAN NULL DEFAULT false,
    `isIroning` BOOLEAN NULL DEFAULT false,
    `active` BOOLEAN NULL DEFAULT true,
    `companyId` INTEGER NULL,
    `hsn` VARCHAR(191) NULL,
    `tax` DOUBLE NULL,
    `processType` VARCHAR(191) NULL,
    `isPrintingJobWork` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyOnProcess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyId` INTEGER NOT NULL,
    `processId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Style` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `productType` VARCHAR(191) NULL,
    `seoTitle` VARCHAR(191) NULL,
    `image` LONGBLOB NULL,
    `sizeTemplateId` INTEGER NULL,
    `fabricId` INTEGER NULL,
    `sleeve` VARCHAR(191) NULL,
    `pattern` VARCHAR(191) NULL,
    `occasion` VARCHAR(191) NULL,
    `material` VARCHAR(191) NULL,
    `washCare` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,
    `hsn` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StyleOnColor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `styleId` INTEGER NOT NULL,
    `colorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessDelivery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `delNo` VARCHAR(191) NULL,
    `delDate` DATE NULL,
    `dueDate` DATE NULL,
    `supplierId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `storeId` INTEGER NOT NULL,
    `processId` INTEGER NOT NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `itemType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NOT NULL,
    `styleId` INTEGER NULL,
    `docId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessDeliveryProgramDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processDeliveryId` INTEGER NOT NULL,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NOT NULL,
    `designId` INTEGER NULL,
    `gaugeId` INTEGER NULL,
    `loopLengthId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `kDiaId` INTEGER NULL,
    `fDiaId` INTEGER NULL,
    `noOfBags` INTEGER NULL,
    `weightPerBag` DOUBLE NULL,
    `qty` DOUBLE NOT NULL,
    `processCost` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RawMaterials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processDeliveryProgramDetailsId` INTEGER NOT NULL,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NOT NULL,
    `designId` INTEGER NULL,
    `gaugeId` INTEGER NULL,
    `loopLengthId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `kDiaId` INTEGER NULL,
    `fDiaId` INTEGER NULL,
    `stockQty` DOUBLE NOT NULL,
    `stockBags` INTEGER NULL,
    `stockRolls` INTEGER NULL,
    `lotNo` VARCHAR(191) NULL,
    `noOfRolls` INTEGER NULL,
    `noOfBags` INTEGER NULL,
    `weightPerBag` DOUBLE NULL,
    `qty` DOUBLE NOT NULL,
    `stockPrice` DOUBLE NULL,
    `processId` INTEGER NULL,
    `stockId` INTEGER NOT NULL,

    UNIQUE INDEX `RawMaterials_stockId_key`(`stockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessInward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processDeliveryId` INTEGER NOT NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `docId` VARCHAR(191) NOT NULL,
    `storeId` INTEGER NOT NULL,
    `branchId` INTEGER NOT NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `userInwardDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessInwardProgramDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processInwardId` INTEGER NOT NULL,
    `processDeliveryProgramDetailsId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgramInwardLotDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processInwardProgramDetailsId` INTEGER NOT NULL,
    `lotNo` VARCHAR(191) NULL,
    `inwardQty` DOUBLE NOT NULL,
    `inwardBags` INTEGER NULL,
    `inwardRolls` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessInwardRawMaterialConsumptionDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processInwardProgramDetailsId` INTEGER NOT NULL,
    `rawMaterialsId` INTEGER NOT NULL,
    `consumptionQty` DOUBLE NOT NULL,
    `lossQty` DOUBLE NOT NULL,
    `stockPrice` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TermsAndConditions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NOT NULL,
    `description` LONGTEXT NOT NULL,
    `companyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `isPurchaseOrder` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuttingOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `styleId` INTEGER NOT NULL,
    `partyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `docId` VARCHAR(191) NOT NULL,
    `vehicleNo` VARCHAR(191) NOT NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuttingOrderDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cuttingOrderId` INTEGER NOT NULL,
    `portionId` INTEGER NULL,
    `colorId` INTEGER NOT NULL,
    `sizeId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `orderQty` DOUBLE NOT NULL,
    `cuttingPrice` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuttingDelivery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `cuttingOrderId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `deliveryId` INTEGER NOT NULL,
    `vehicleNo` VARCHAR(191) NOT NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NULL,
    `branchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuttingDeliveryDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cuttingDeliveryId` INTEGER NOT NULL,
    `processId` INTEGER NULL,
    `fabricId` INTEGER NOT NULL,
    `colorId` INTEGER NOT NULL,
    `designId` INTEGER NOT NULL,
    `gsmId` INTEGER NOT NULL,
    `loopLengthId` INTEGER NOT NULL,
    `kDiaId` INTEGER NOT NULL,
    `fDiaId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `delRolls` INTEGER NOT NULL,
    `delQty` DOUBLE NOT NULL,
    `gaugeId` INTEGER NOT NULL,
    `lotNo` VARCHAR(191) NULL,
    `stockPrice` DOUBLE NULL,
    `storeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuttingReceipt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `cuttingOrderId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `deliveryId` INTEGER NOT NULL,
    `supplierDc` VARCHAR(191) NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `branchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuttingReceiptInwardDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cuttingReceiptId` INTEGER NOT NULL,
    `cuttingOrderDetailsId` INTEGER NOT NULL,
    `receivedQty` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuttingReceiptFabricConsumptionDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cuttingReceiptId` INTEGER NOT NULL,
    `cuttingDeliveryDetailsId` INTEGER NOT NULL,
    `consumption` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LossReason` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reason` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuttingReceiptFabricLossDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lossReasonId` INTEGER NOT NULL,
    `lossQty` DOUBLE NOT NULL,
    `cuttingReceiptFabricConsumptionDetailsId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuttingExcessFabricReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `cuttingOrderId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `supplierDc` VARCHAR(191) NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `branchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuttingExcessFabricReturnDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cuttingDeliveryDetailsId` INTEGER NOT NULL,
    `returnExcessQty` DOUBLE NOT NULL,
    `returnExcessRolls` DOUBLE NOT NULL,
    `cuttingExcessFabricReturnId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockForPcs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inOrOut` ENUM('In', 'Out') NOT NULL,
    `portionId` INTEGER NULL,
    `styleId` INTEGER NOT NULL,
    `sizeId` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `branchId` INTEGER NOT NULL,
    `prevProcessId` INTEGER NULL,
    `cuttingReceiptInwardDetailsId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `productionDeliveryDetailsId` INTEGER NULL,
    `productionReceiptDetailsId` INTEGER NULL,
    `finishedGoodsSalesDetailsId` INTEGER NULL,
    `finishedGoodsOpeningStockDetailsId` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedGoodsSalesDeliveryDetailsId` INTEGER NULL,
    `stockTransferFinishedGoodsDetailsId` INTEGER NULL,
    `stockTransferFinishedGoodsReceiptDetailsId` INTEGER NULL,
    `onlineSalesDetailsId` INTEGER NULL,
    `onlineSalesReturnDetailsId` INTEGER NULL,

    UNIQUE INDEX `StockForPcs_cuttingReceiptInwardDetailsId_key`(`cuttingReceiptInwardDetailsId`),
    UNIQUE INDEX `StockForPcs_productionDeliveryDetailsId_key`(`productionDeliveryDetailsId`),
    UNIQUE INDEX `StockForPcs_productionReceiptDetailsId_key`(`productionReceiptDetailsId`),
    UNIQUE INDEX `StockForPcs_finishedGoodsSalesDetailsId_key`(`finishedGoodsSalesDetailsId`),
    UNIQUE INDEX `StockForPcs_finishedGoodsOpeningStockDetailsId_key`(`finishedGoodsOpeningStockDetailsId`),
    UNIQUE INDEX `StockForPcs_finishedGoodsSalesDeliveryDetailsId_key`(`finishedGoodsSalesDeliveryDetailsId`),
    UNIQUE INDEX `StockForPcs_stockTransferFinishedGoodsDetailsId_key`(`stockTransferFinishedGoodsDetailsId`),
    UNIQUE INDEX `StockForPcs_stockTransferFinishedGoodsReceiptDetailsId_key`(`stockTransferFinishedGoodsReceiptDetailsId`),
    UNIQUE INDEX `StockForPcs_onlineSalesDetailsId_key`(`onlineSalesDetailsId`),
    UNIQUE INDEX `StockForPcs_onlineSalesReturnDetailsId_key`(`onlineSalesReturnDetailsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BillEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processId` INTEGER NULL,
    `poType` VARCHAR(191) NULL,
    `supplierId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `storeId` INTEGER NULL,
    `docId` VARCHAR(191) NOT NULL,
    `payTermId` INTEGER NULL,
    `taxTemplateId` INTEGER NULL,
    `partyBillNo` VARCHAR(191) NULL,
    `netBillValue` INTEGER NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `partyBillDate` DATE NULL,
    `isProcessBillEntry` BOOLEAN NOT NULL DEFAULT false,
    `rawMaterialsSalesId` INTEGER NULL,
    `finishedGoodsSalesId` INTEGER NULL,
    `printingJobWorkId` INTEGER NULL,
    `isDirect` BOOLEAN NULL DEFAULT true,

    UNIQUE INDEX `BillEntry_rawMaterialsSalesId_key`(`rawMaterialsSalesId`),
    UNIQUE INDEX `BillEntry_finishedGoodsSalesId_key`(`finishedGoodsSalesId`),
    UNIQUE INDEX `BillEntry_printingJobWorkId_key`(`printingJobWorkId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BillEntryItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isPoItem` BOOLEAN NOT NULL DEFAULT false,
    `billEntryId` INTEGER NOT NULL,
    `poItemsId` INTEGER NULL,
    `directItemsId` INTEGER NULL,
    `processDeliveryProgramDetailsId` INTEGER NULL,
    `qty` DOUBLE NOT NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `price` DOUBLE NULL DEFAULT 0,
    `taxPercent` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,
    `accessoryInwardItemsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryBillEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processId` INTEGER NULL,
    `poType` VARCHAR(191) NULL,
    `supplierId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `storeId` INTEGER NULL,
    `docId` VARCHAR(191) NOT NULL,
    `payTermId` INTEGER NULL,
    `taxTemplateId` INTEGER NULL,
    `partyBillNo` VARCHAR(191) NULL,
    `netBillValue` INTEGER NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `partyBillDate` DATE NULL,
    `isProcessBillEntry` BOOLEAN NOT NULL DEFAULT false,
    `isDirect` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryBillEntryItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isPoItem` BOOLEAN NOT NULL DEFAULT false,
    `accessoryBillEntryId` INTEGER NOT NULL,
    `accessoryPoItemsId` INTEGER NULL,
    `accessoryInwardItemsId` INTEGER NULL,
    `processDeliveryProgramDetailsId` INTEGER NULL,
    `qty` DOUBLE NOT NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `price` DOUBLE NULL DEFAULT 0,
    `taxPercent` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payout` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `paymentType` ENUM('AgainstBill', 'Advance') NOT NULL,
    `paymentMode` ENUM('Check', 'Online', 'Upi', 'Cash', 'Credit', 'NEFT', 'RDGS', 'IMVS', 'IMPS') NOT NULL,
    `refNo` VARCHAR(191) NULL,
    `payOutDate` DATE NULL,
    `amount` DOUBLE NOT NULL,
    `payerType` ENUM('My_Payment', 'Customer_Payment') NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayOutItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payoutId` INTEGER NOT NULL,
    `billEntryId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdvanceAdjustMent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `advancePayOutId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdvanceAdjustDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `advanceAdjustMentId` INTEGER NOT NULL,
    `billEntryId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ledger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `EntryType` ENUM('Purchase_Bill', 'Process_Bill', 'Sales', 'My_Payment', 'Customer_Payment', 'Credit_Note', 'Debit_Note', 'Opening_Balance', 'Printing_Job_Work') NOT NULL,
    `LedgerType` ENUM('Supplier', 'Customer') NULL,
    `creditOrDebit` ENUM('Credit', 'Debit') NULL,
    `billEntryId` INTEGER NULL,
    `payoutId` INTEGER NULL,
    `partyId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `partyBillDate` DATE NULL,
    `partyBillNo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `creditDebitNoteId` INTEGER NULL,

    UNIQUE INDEX `Ledger_billEntryId_key`(`billEntryId`),
    UNIQUE INDEX `Ledger_payoutId_key`(`payoutId`),
    UNIQUE INDEX `Ledger_creditDebitNoteId_key`(`creditDebitNoteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessDeliveryReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processDeliveryId` INTEGER NOT NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `docId` VARCHAR(191) NOT NULL,
    `storeId` INTEGER NOT NULL,
    `branchId` INTEGER NOT NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `userInwardDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessDeliveryReturnProgramDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processDeliveryReturnId` INTEGER NOT NULL,
    `processDeliveryProgramDetailsId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessDeliveryReturnRawMaterialDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processDeliveryReturnProgramDetailsId` INTEGER NOT NULL,
    `stockPrice` DOUBLE NULL,
    `rawMaterialsId` INTEGER NOT NULL,
    `returnRolls` INTEGER NULL,
    `returnBags` INTEGER NULL,
    `returnQty` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductionDelivery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `storeId` INTEGER NOT NULL,
    `supplierId` INTEGER NULL,
    `deliveryId` INTEGER NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `userInwardDate` DATETIME(3) NULL,
    `productionType` ENUM('INHOUSE', 'OUTSIDE') NOT NULL,
    `styleId` INTEGER NOT NULL,
    `fromProcessId` INTEGER NULL,
    `toProcessId` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `dueDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductionDeliveryDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productionDeliveryId` INTEGER NOT NULL,
    `styleId` INTEGER NOT NULL,
    `portionId` INTEGER NULL,
    `uomId` INTEGER NOT NULL,
    `colorId` INTEGER NOT NULL,
    `sizeId` INTEGER NOT NULL,
    `prevProcessId` INTEGER NULL,
    `delQty` INTEGER NOT NULL,
    `processCost` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductionReceipt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `prevProcessId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `storeId` INTEGER NOT NULL,
    `supplierId` INTEGER NULL,
    `deliveryId` INTEGER NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `userInwardDate` DATETIME(3) NULL,
    `supplierDc` VARCHAR(191) NULL,
    `styleId` INTEGER NOT NULL,
    `productionDeliveryId` INTEGER NOT NULL,
    `branchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductionReceiptDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productionReceiptId` INTEGER NOT NULL,
    `productionDeliveryDetailsId` INTEGER NOT NULL,
    `receivedQty` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductionReceiptLossDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productionReceiptDetailsId` INTEGER NOT NULL,
    `lossReasonId` INTEGER NOT NULL,
    `lossQty` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RawMaterialsSales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `poType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NOT NULL,
    `processId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `storeId` INTEGER NOT NULL,
    `supplierId` INTEGER NULL,
    `deliveryId` INTEGER NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `userInwardDate` DATETIME(3) NULL,
    `supplierPoDetail` VARCHAR(191) NULL,
    `branchId` INTEGER NOT NULL,
    `taxTemplateId` INTEGER NULL,
    `invoiceType` ENUM('Cash', 'Credit') NULL,
    `discountType` ENUM('Flat', 'Percentage') NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `eWayBillNo` VARCHAR(191) NULL,
    `poNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RawMaterialsSalesDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rawMaterialsSalesId` INTEGER NOT NULL,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NOT NULL,
    `designId` INTEGER NULL,
    `gaugeId` INTEGER NULL,
    `loopLengthId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `kDiaId` INTEGER NULL,
    `fDiaId` INTEGER NULL,
    `qty` DOUBLE NOT NULL,
    `price` DOUBLE NOT NULL,
    `noOfRolls` INTEGER NULL DEFAULT 0,
    `noOfBags` INTEGER NULL DEFAULT 0,
    `storeId` INTEGER NOT NULL,
    `branchId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `processId` INTEGER NULL,
    `lotNo` VARCHAR(191) NULL,
    `stockPrice` DOUBLE NULL,
    `stockQty` DOUBLE NULL,
    `taxPercent` DOUBLE NULL,
    `weightPerBag` INTEGER NULL,
    `stockRolls` INTEGER NULL,
    `stockBags` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinishedGoodsSales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `storeId` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `userInwardDate` DATETIME(3) NULL,
    `salesType` ENUM('WHOLESALE', 'RETAIL') NOT NULL,
    `branchId` INTEGER NOT NULL,
    `isTaxBill` BOOLEAN NOT NULL DEFAULT false,
    `customerName` VARCHAR(191) NULL,
    `customerMobile` VARCHAR(191) NULL,
    `taxTemplateId` INTEGER NULL,
    `invoiceType` ENUM('Cash', 'Credit') NULL,
    `discountType` ENUM('Flat', 'Percentage') NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `eWayBillNo` VARCHAR(191) NULL,
    `poNo` VARCHAR(191) NULL,
    `finishedGoodsBillType` ENUM('DIRECT', 'AGAINSTDELIVERY') NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinishedGoodsSalesDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `finishedGoodsSalesId` INTEGER NOT NULL,
    `styleId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `colorId` INTEGER NOT NULL,
    `sizeId` INTEGER NOT NULL,
    `prevProcessId` INTEGER NULL,
    `qty` INTEGER NOT NULL,
    `price` DOUBLE NULL,
    `tax` DOUBLE NULL,
    `finishedGoodsSalesDeliveryDetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RawMaterialOpeningStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `rawMaterialType` ENUM('GreyYarn', 'DyedYarn', 'GreyFabric', 'DyedFabric', 'Accessory') NULL,
    `storeId` INTEGER NULL,
    `branchId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RawMaterialOpeningStockItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rawMaterialOpeningStockId` INTEGER NOT NULL,
    `prevProcessId` INTEGER NULL,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NOT NULL,
    `noOfRolls` INTEGER NULL,
    `noOfBags` INTEGER NULL,
    `weightPerBag` DOUBLE NULL,
    `qty` DOUBLE NOT NULL,
    `price` DOUBLE NOT NULL,
    `designId` INTEGER NULL,
    `gaugeId` INTEGER NULL,
    `loopLengthId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `kDiaId` INTEGER NULL,
    `fDiaId` INTEGER NULL,
    `lotNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinishedGoodsOpeningStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `styleId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinishedGoodsOpeningStockDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `finishedGoodsOpeningStockId` INTEGER NOT NULL,
    `prevProcessId` INTEGER NULL,
    `colorId` INTEGER NOT NULL,
    `sizeId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `qty` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Portion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StyleOnPortion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `portionId` INTEGER NOT NULL,
    `styleId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinishedGoodsSalesDelivery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `storeId` INTEGER NOT NULL,
    `supplierId` INTEGER NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `userDeliveryDate` DATETIME(3) NULL,
    `branchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinishedGoodsSalesDeliveryDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `finishedGoodsSalesDeliveryId` INTEGER NOT NULL,
    `styleId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `colorId` INTEGER NOT NULL,
    `sizeId` INTEGER NOT NULL,
    `prevProcessId` INTEGER NULL,
    `qty` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockTransferFinishedGoods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `delOrRec` ENUM('DELIVERY', 'RECEIPT') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `storeId` INTEGER NOT NULL,
    `deliveryToBranchId` INTEGER NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `userDeliveryDate` DATETIME(3) NULL,
    `branchId` INTEGER NOT NULL,
    `prevDeliveryId` INTEGER NULL,

    UNIQUE INDEX `StockTransferFinishedGoods_prevDeliveryId_key`(`prevDeliveryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockTransferFinishedGoodsDeliveryDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferFinishedGoodsId` INTEGER NOT NULL,
    `styleId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `colorId` INTEGER NOT NULL,
    `sizeId` INTEGER NOT NULL,
    `prevProcessId` INTEGER NULL,
    `qty` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockTransferFinishedGoodsReceiptDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferFinishedGoodsId` INTEGER NOT NULL,
    `stockTransferDeliveryDetailsId` INTEGER NOT NULL,
    `styleId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `colorId` INTEGER NOT NULL,
    `sizeId` INTEGER NOT NULL,
    `prevProcessId` INTEGER NULL,
    `qty` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceTemplateStyleWiseDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `styleId` INTEGER NOT NULL,
    `priceTemplateId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceTemplateStyleSizeDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sizeId` INTEGER NOT NULL,
    `PriceTemplateStyleWiseDetailsId` INTEGER NULL,
    `price` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrintingJobWork` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `supplierDc` VARCHAR(191) NULL,
    `taxTemplateId` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `discountType` ENUM('Flat', 'Percentage') NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `branchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrintingJobWorkDet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `printingJobWorkId` INTEGER NOT NULL,
    `processId` INTEGER NOT NULL,
    `uomId` INTEGER NULL,
    `qty` DOUBLE NOT NULL DEFAULT 0,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `tax` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OnlineSales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `storeId` INTEGER NOT NULL,
    `supplierId` INTEGER NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `userDeliveryDate` DATETIME(3) NULL,
    `branchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OnlineSalesDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `onlineSalesId` INTEGER NOT NULL,
    `styleId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `colorId` INTEGER NOT NULL,
    `sizeId` INTEGER NOT NULL,
    `prevProcessId` INTEGER NULL,
    `qty` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OnlineSalesReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `storeId` INTEGER NOT NULL,
    `supplierId` INTEGER NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `userDeliveryDate` DATETIME(3) NULL,
    `branchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OnlineSalesReturnDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `onlineSalesReturnId` INTEGER NOT NULL,
    `onlineSalesDetailsId` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditDebitNote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `type` ENUM('Credit', 'Debit') NOT NULL,
    `amount` DOUBLE NULL,
    `tax` DOUBLE NULL,
    `narration` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `taxTemplateId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `phone` VARCHAR(191) NULL,
    `contactPersonName` VARCHAR(191) NOT NULL,
    `address` LONGTEXT NULL,
    `orderDate` DATETIME(3) NULL,
    `validDate` DATETIME(3) NULL,
    `gmail` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `companyId` INTEGER NULL,
    `partyId` INTEGER NULL,
    `packingCoverType` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `finYearId` INTEGER NULL,
    `notes` LONGTEXT NULL,
    `term` LONGTEXT NULL,
    `orderBy` VARCHAR(191) NULL,
    `draftSave` BOOLEAN NULL DEFAULT false,
    `isPlanning` BOOLEAN NULL DEFAULT false,
    `isMaterialRequest` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NULL,
    `yarnNeedleId` INTEGER NULL,
    `machineId` INTEGER NULL,
    `fiberContentId` INTEGER NULL,
    `description` LONGTEXT NULL,
    `qty` DOUBLE NULL,
    `socksMaterialId` INTEGER NULL,
    `measurements` VARCHAR(191) NULL,
    `sizeId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `baseColorId` INTEGER NULL,
    `noOfStripes` VARCHAR(191) NULL,
    `socksTypeId` INTEGER NULL,
    `filePath` LONGTEXT NULL,
    `isPlanning` BOOLEAN NULL DEFAULT false,
    `isMaterialRequest` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderSizeDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sizeId` INTEGER NULL,
    `sizeMeasurement` VARCHAR(191) NULL,
    `qty` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `orderdetailsId` INTEGER NULL,
    `uomId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderYarnDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `colorId` INTEGER NULL,
    `yarncategoryId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `count` INTEGER NULL,
    `yarnKneedleId` INTEGER NULL,
    `orderdetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Machine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `time` DOUBLE NULL,
    `production` DOUBLE NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShippingAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierId` INTEGER NULL,
    `address` LONGTEXT NULL,
    `aliasName` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contactPersonName` VARCHAR(191) NULL,
    `mobileNo` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocksType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Measurement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FiberContent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aliasName` VARCHAR(191) NULL,
    `fabricName` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FiberBlend` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fabricId` INTEGER NULL,
    `percentage` INTEGER NULL,
    `fiberContentId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YarnNeedle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `machineId` INTEGER NULL,
    `aliasName` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyKYC` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyName` VARCHAR(191) NOT NULL,
    `gstNumber` VARCHAR(191) NULL,
    `panNumber` VARCHAR(191) NULL,
    `aadharNumber` VARCHAR(191) NULL,
    `registrationNumber` VARCHAR(191) NULL,
    `ownerName` VARCHAR(191) NOT NULL,
    `contactNumber` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `cityState` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `businessType` VARCHAR(191) NOT NULL,
    `productCategories` VARCHAR(191) NOT NULL,
    `documents` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sample` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `partyId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `validDate` DATETIME(3) NULL,
    `address` LONGTEXT NULL,
    `phone` VARCHAR(191) NULL,
    `contactPersonName` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `remarks` LONGTEXT NULL,
    `notes` LONGTEXT NULL,
    `term` LONGTEXT NULL,
    `sampleSubmitBy` VARCHAR(191) NULL,
    `userId` INTEGER NULL,
    `filePath` LONGTEXT NULL,
    `draftSave` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sampleDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sampleId` INTEGER NULL,
    `sampleQty` INTEGER NULL,
    `sampleWeight` DOUBLE NULL,
    `orderId` INTEGER NULL,
    `yarnNeedleId` INTEGER NULL,
    `machineId` INTEGER NULL,
    `fiberContentId` INTEGER NULL,
    `description` LONGTEXT NULL,
    `orderQty` DOUBLE NULL,
    `socksMaterialId` INTEGER NULL,
    `measurements` VARCHAR(191) NULL,
    `styleId` INTEGER NULL,
    `footcolorId` INTEGER NULL,
    `stripecolorId` INTEGER NULL,
    `noOfStripes` VARCHAR(191) NULL,
    `socksTypeId` INTEGER NULL,
    `filePath` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sampleSizeDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sampleId` INTEGER NULL,
    `sampleDetailsId` INTEGER NULL,
    `yarnNeedleId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `gsmId` INTEGER NULL,
    `weight` DOUBLE NULL,
    `remarks` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sampleYarnDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `colorId` INTEGER NULL,
    `yarncategoryId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `count` VARCHAR(191) NULL,
    `yarnKneedleId` INTEGER NULL,
    `sampleDetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequirementPlanningForm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `partyId` INTEGER NULL,
    `requirementDate` DATETIME(3) NULL,
    `remarks` LONGTEXT NULL,
    `specialInstructions` VARCHAR(191) NULL,
    `orderId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `jobNumber` VARCHAR(191) NULL,
    `isMaterialRequst` BOOLEAN NULL DEFAULT false,
    `isMaterialIssue` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequirementPlanningItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requirementPlanningFormId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `percentage` DOUBLE NULL,
    `colorId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `count` INTEGER NULL,
    `poType` VARCHAR(191) NULL,
    `transType` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,
    `requiredQty` DOUBLE NULL,
    `isProcess` VARCHAR(191) NULL,
    `processId` INTEGER NULL,
    `lossPercentage` DOUBLE NULL,
    `wastagePercentage` DOUBLE NULL,
    `yarnType` VARCHAR(191) NULL,
    `tranferQty` DOUBLE NULL,
    `isMaterialRequst` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequirementSizeDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requirementPlanningFormId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `gsmId` INTEGER NULL,
    `weight` DOUBLE NULL,
    `remarks` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequirementYarnDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `RequirementPlanningId` INTEGER NULL,
    `percentage` INTEGER NULL,
    `colorId` INTEGER NULL,
    `yarncategoryId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `count` INTEGER NULL,
    `yarnKneedleId` INTEGER NULL,
    `isProcess` VARCHAR(191) NULL,
    `processId` INTEGER NULL,
    `lossPercentage` DOUBLE NULL,
    `wastagePercentage` DOUBLE NULL,
    `yarnType` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequirementYarnProcessList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requirementYarnDetailsId` INTEGER NULL,
    `processId` INTEGER NULL,
    `sequence` INTEGER NULL,
    `lossPercentage` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequirementPlanningProcessList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requirementPlanningItemsId` INTEGER NULL,
    `processId` INTEGER NULL,
    `sequence` INTEGER NULL,
    `lossPercentage` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryRequirementPlanning` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `RequirementPlanningId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `poQty` DOUBLE NULL,
    `qty` DOUBLE NULL,
    `requiredQty` DOUBLE NULL,
    `uomId` INTEGER NULL,
    `percentage` DOUBLE NULL,
    `tranferQty` INTEGER NULL,
    `isMaterialRequst` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RaiseIndent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `phone` VARCHAR(191) NULL,
    `contactPersonName` VARCHAR(191) NOT NULL,
    `address` LONGTEXT NULL,
    `orderDate` DATETIME(3) NULL,
    `validDate` DATETIME(3) NULL,
    `gmail` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `companyId` INTEGER NULL,
    `partyId` INTEGER NULL,
    `packingCoverType` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `finYearId` INTEGER NULL,
    `notes` LONGTEXT NULL,
    `term` LONGTEXT NULL,
    `orderBy` VARCHAR(191) NULL,
    `orderId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `requirementId` INTEGER NULL,
    `draftSave` BOOLEAN NULL DEFAULT false,
    `isMaterialRequset` BOOLEAN NULL DEFAULT false,
    `isMaterialIssue` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialTypeList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `value` VARCHAR(191) NULL,
    `raiseIndentId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RaiseIndentItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `raiseIndentId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `styleColor` VARCHAR(191) NULL,
    `requiredQty` DOUBLE NULL,
    `qty` DOUBLE NULL,
    `requirementPlanningFormId` INTEGER NULL,
    `requirementPlanningItemsId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RaiseIndenetYarnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `raiseIndentItemsId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `yarnNeedleId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `count` INTEGER NULL,
    `qty` DOUBLE NULL,
    `issueQty` DOUBLE NULL,
    `percentage` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `requirementPlanningId` INTEGER NULL,
    `orderdetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryRaiseIndentItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `raiseIndentId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleColor` VARCHAR(191) NULL,
    `requiredQty` DOUBLE NULL,
    `qty` DOUBLE NULL,
    `requirementPlanningFormId` INTEGER NULL,
    `accessoryRequirementPlanningId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialIssue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `phone` VARCHAR(191) NULL,
    `contactPersonName` VARCHAR(191) NOT NULL,
    `address` LONGTEXT NULL,
    `orderDate` DATETIME(3) NULL,
    `validDate` DATETIME(3) NULL,
    `gmail` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `companyId` INTEGER NULL,
    `partyId` INTEGER NULL,
    `packingCoverType` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `finYearId` INTEGER NULL,
    `notes` LONGTEXT NULL,
    `term` LONGTEXT NULL,
    `orderBy` VARCHAR(191) NULL,
    `orderId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `requirementId` INTEGER NULL,
    `draftSave` BOOLEAN NULL DEFAULT false,
    `isMaterialIssue` BOOLEAN NULL DEFAULT false,
    `raiseIndentId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialIssueItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `materialIssueId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `requirementPlanningFormId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `requiredQty` DOUBLE NULL,
    `issueQty` DOUBLE NULL,
    `raiseIndentId` INTEGER NULL,
    `styleColor` VARCHAR(191) NULL,
    `raiseIndentItemsId` INTEGER NULL,
    `requirementPlanningItemsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryMaterialIssueItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `materialIssueId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `requirementPlanningFormId` INTEGER NULL,
    `orderDetailsId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `requiredQty` DOUBLE NULL,
    `issueQty` DOUBLE NULL,
    `raiseIndentId` INTEGER NULL,
    `styleColor` VARCHAR(191) NULL,
    `accessoryRaiseIndentItemsId` INTEGER NULL,
    `accessoryRequirementPlanningId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialIssueTypeList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `value` VARCHAR(191) NULL,
    `materialIssueId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialIssueYarnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `materialIssueItemsId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `yarnNeedleId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `count` INTEGER NULL,
    `qty` DOUBLE NULL,
    `issueQty` DOUBLE NULL,
    `percentage` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `requirementPlanningId` INTEGER NULL,
    `orderdetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockTransfer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `fromOrderId` INTEGER NULL,
    `toOrderId` INTEGER NULL,
    `transferType` VARCHAR(191) NULL,
    `fromCustomerId` INTEGER NULL,
    `toCustomerId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FromOrderTransferItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `transferQty` DOUBLE NULL,
    `stockQty` DOUBLE NULL,
    `orderDetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ToOrderTransferTtems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferId` INTEGER NULL,
    `RequirementPlanningId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `style` VARCHAR(191) NULL,
    `qty` DOUBLE NULL,
    `transferQty` DOUBLE NULL,
    `balanceQty` DOUBLE NULL,
    `requiredQty` DOUBLE NULL,
    `orderDetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoyStockTransfer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `transferType` VARCHAR(191) NULL,
    `fromOrderId` INTEGER NULL,
    `toOrderId` INTEGER NULL,
    `fromCustomerId` INTEGER NULL,
    `toCustomerId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FromAccessoryTransferItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `transferQty` DOUBLE NULL,
    `stockQty` DOUBLE NULL,
    `orderDetailsId` INTEGER NULL,
    `accessoryRequirementPlanningId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ToAccessoryTransferItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockTransferId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `transferQty` DOUBLE NULL,
    `stockQty` DOUBLE NULL,
    `orderDetailsId` INTEGER NULL,
    `accessoryRequirementPlanningId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DirectReturnOrPoReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poInwardOrDirectInward` VARCHAR(191) NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATE NULL,
    `poType` VARCHAR(191) NULL,
    `supplierId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `storeId` INTEGER NULL,
    `docId` VARCHAR(191) NOT NULL,
    `payTermId` INTEGER NULL,
    `taxTemplateId` INTEGER NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` LONGTEXT NULL,
    `remarks` LONGTEXT NULL,
    `isDeleted` BOOLEAN NULL,
    `orderdetailsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DirectReturnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `price` DOUBLE NOT NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NOT NULL DEFAULT 0,
    `taxPercent` DOUBLE NOT NULL DEFAULT 0,
    `designId` INTEGER NULL,
    `gaugeId` INTEGER NULL,
    `loopLengthId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `kDiaId` INTEGER NULL,
    `fDiaId` INTEGER NULL,
    `directReturnOrPoReturnId` INTEGER NOT NULL,
    `weightPerBag` DOUBLE NULL,
    `noOfBags` INTEGER NULL,
    `noOfRolls` INTEGER NULL,
    `qty` DOUBLE NULL,
    `poItemsId` INTEGER NULL,
    `directItemsId` INTEGER NULL,
    `alreadyInwardedQty` DOUBLE NULL,
    `alreadyReturnedQty` DOUBLE NULL,
    `balanceQty` DOUBLE NULL,
    `cancelQty` DOUBLE NULL,
    `poNo` VARCHAR(191) NULL,
    `poQty` DOUBLE NULL,
    `accessoryInwardItemsId` INTEGER NULL,
    `isDeleted` BOOLEAN NULL,
    `orderDetailsId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `requirementPlanningItemsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poInwardOrDirectInward` VARCHAR(191) NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATE NULL,
    `poType` VARCHAR(191) NULL,
    `supplierId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `storeId` INTEGER NULL,
    `docId` VARCHAR(191) NOT NULL,
    `payTermId` INTEGER NULL,
    `taxTemplateId` INTEGER NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `vehicleNo` VARCHAR(191) NULL,
    `specialInstructions` LONGTEXT NULL,
    `remarks` LONGTEXT NULL,
    `isDeleted` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryReturnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `price` DOUBLE NOT NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NOT NULL DEFAULT 0,
    `taxPercent` DOUBLE NOT NULL DEFAULT 0,
    `designId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `accessoryReturnId` INTEGER NOT NULL,
    `weightPerBag` DOUBLE NULL,
    `noOfBags` INTEGER NULL,
    `noOfRolls` INTEGER NULL,
    `qty` DOUBLE NULL,
    `accessoryPoItemsId` INTEGER NULL,
    `alreadyInwardedQty` DOUBLE NULL,
    `alreadyReturnedQty` DOUBLE NULL,
    `balanceQty` DOUBLE NULL,
    `cancelQty` DOUBLE NULL,
    `poNo` VARCHAR(191) NULL,
    `poQty` DOUBLE NULL,
    `accessoryInwardItemsId` INTEGER NULL,
    `isDeleted` BOOLEAN NULL,
    `orderDetailsId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `accessoryRequirementPlanningId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReturnLotDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `directReturnItemsId` INTEGER NOT NULL,
    `lotNo` VARCHAR(191) NULL,
    `qty` DOUBLE NULL,
    `noOfRolls` INTEGER NULL,
    `accessoryReturnItemsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseCancel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poInwardOrDirectInward` VARCHAR(191) NULL,
    `poType` VARCHAR(191) NULL,
    `supplierId` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `docId` VARCHAR(191) NULL,
    `remarks` LONGTEXT NULL,
    `po` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CancelItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `price` DOUBLE NOT NULL,
    `designId` INTEGER NULL,
    `gaugeId` INTEGER NULL,
    `loopLengthId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `kDiaId` INTEGER NULL,
    `fDiaId` INTEGER NULL,
    `purchaseCancelId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `poItemsId` INTEGER NULL,
    `poNo` VARCHAR(191) NULL,
    `poQty` DOUBLE NULL,
    `cancelType` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NULL,
    `cancelItems` INTEGER NULL,
    `orderId` INTEGER NULL,
    `accessoryRequirementPlanningId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccesssoryPurchaseCancel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poInwardOrDirectInward` VARCHAR(191) NULL,
    `poType` VARCHAR(191) NULL,
    `supplierId` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `docId` VARCHAR(191) NULL,
    `remarks` LONGTEXT NULL,
    `po` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryCancelItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fabricId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `price` DOUBLE NOT NULL,
    `sizeId` INTEGER NULL,
    `designId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `accesssoryPurchaseCancelId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `poItemsId` INTEGER NULL,
    `poNo` VARCHAR(191) NULL,
    `poQty` DOUBLE NULL,
    `cancelType` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InwardLotDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `directItemsId` INTEGER NOT NULL,
    `lotNo` VARCHAR(191) NULL,
    `qty` DOUBLE NULL,
    `noOfBags` INTEGER NULL,
    `accessoryInwardItemsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RawMaterial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,
    `partyId` INTEGER NULL,
    `aliasName` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BranchType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT false,
    `aliasName` VARCHAR(191) NULL,
    `isMainBranch` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExcessTolerance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `docDate` VARCHAR(191) NULL,
    `materialId` INTEGER NULL,
    `material` VARCHAR(191) NULL,

    UNIQUE INDEX `ExcessTolerance_docId_key`(`docId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExcessToleranceItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `excessToleranceId` INTEGER NULL,
    `materialId` INTEGER NULL,
    `material` VARCHAR(191) NULL,
    `excessType` VARCHAR(191) NULL,
    `orderType` VARCHAR(191) NULL,
    `qty` VARCHAR(191) NULL,
    `roundOfType` VARCHAR(191) NULL,
    `bagweight` VARCHAR(191) NULL,
    `from` VARCHAR(191) NULL,
    `to` VARCHAR(191) NULL,
    `excessQty` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,
    `applyon` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TermsAndConditionsNew` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `termsAndCondition` LONGTEXT NULL,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockReportControl` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isStockReport` LONGTEXT NULL,
    `active` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DirectItemsToStock` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_DirectItemsToStock_AB_unique`(`A`, `B`),
    INDEX `_DirectItemsToStock_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_pageGroupId_fkey` FOREIGN KEY (`pageGroupId`) REFERENCES `PageGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOnBranch` ADD CONSTRAINT `UserOnBranch_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOnBranch` ADD CONSTRAINT `UserOnBranch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleOnPage` ADD CONSTRAINT `RoleOnPage_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleOnPage` ADD CONSTRAINT `RoleOnPage_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_localCityId_fkey` FOREIGN KEY (`localCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_permCityId_fkey` FOREIGN KEY (`permCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_employeeCategoryId_fkey` FOREIGN KEY (`employeeCategoryId`) REFERENCES `EmployeeCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinYear` ADD CONSTRAINT `FinYear_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeCategory` ADD CONSTRAINT `EmployeeCategory_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Country` ADD CONSTRAINT `Country_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `State` ADD CONSTRAINT `State_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `Country`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `City` ADD CONSTRAINT `City_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `State`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyCategory` ADD CONSTRAINT `PartyCategory_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Currency` ADD CONSTRAINT `Currency_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_currencyId_fkey` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_priceTemplateId_fkey` FOREIGN KEY (`priceTemplateId`) REFERENCES `PriceTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_branchCityId_fkey` FOREIGN KEY (`branchCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_branchTypeId_fkey` FOREIGN KEY (`branchTypeId`) REFERENCES `BranchType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchContactDetails` ADD CONSTRAINT `BranchContactDetails_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `PartyBranch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchContactDetails` ADD CONSTRAINT `BranchContactDetails_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyShippingAddress` ADD CONSTRAINT `PartyShippingAddress_partyBranchId_fkey` FOREIGN KEY (`partyBranchId`) REFERENCES `PartyBranch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyMaterials` ADD CONSTRAINT `PartyMaterials_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyContactDetails` ADD CONSTRAINT `PartyContactDetails_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyAttachments` ADD CONSTRAINT `PartyAttachments_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchAttchments` ADD CONSTRAINT `BranchAttchments_partyBranchId_fkey` FOREIGN KEY (`partyBranchId`) REFERENCES `PartyBranch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CertificateDetail` ADD CONSTRAINT `CertificateDetail_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CertificateDetail` ADD CONSTRAINT `CertificateDetail_certificateId_fkey` FOREIGN KEY (`certificateId`) REFERENCES `Certificate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyOnAccessoryItems` ADD CONSTRAINT `PartyOnAccessoryItems_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyOnAccessoryItems` ADD CONSTRAINT `PartyOnAccessoryItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Content` ADD CONSTRAINT `Content_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Counts` ADD CONSTRAINT `Counts_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnType` ADD CONSTRAINT `YarnType_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Hsn` ADD CONSTRAINT `Hsn_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnBlend` ADD CONSTRAINT `YarnBlend_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Yarn` ADD CONSTRAINT `Yarn_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `Content`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Yarn` ADD CONSTRAINT `Yarn_yarnTypeId_fkey` FOREIGN KEY (`yarnTypeId`) REFERENCES `YarnType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Yarn` ADD CONSTRAINT `Yarn_countsId_fkey` FOREIGN KEY (`countsId`) REFERENCES `Counts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Yarn` ADD CONSTRAINT `Yarn_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Yarn` ADD CONSTRAINT `Yarn_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yarnCounts` ADD CONSTRAINT `yarnCounts_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yarnCounts` ADD CONSTRAINT `yarnCounts_yarnTypeId_fkey` FOREIGN KEY (`yarnTypeId`) REFERENCES `YarnType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnOnYarnBlend` ADD CONSTRAINT `YarnOnYarnBlend_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnOnYarnBlend` ADD CONSTRAINT `YarnOnYarnBlend_yarnBlendId_fkey` FOREIGN KEY (`yarnBlendId`) REFERENCES `YarnBlend`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricType` ADD CONSTRAINT `FabricType_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fabric` ADD CONSTRAINT `Fabric_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fabric` ADD CONSTRAINT `Fabric_fabricTypeId_fkey` FOREIGN KEY (`fabricTypeId`) REFERENCES `FabricType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricOnYarnBlend` ADD CONSTRAINT `FabricOnYarnBlend_yarnBlendId_fkey` FOREIGN KEY (`yarnBlendId`) REFERENCES `YarnBlend`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricOnYarnBlend` ADD CONSTRAINT `FabricOnYarnBlend_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryGroup` ADD CONSTRAINT `AccessoryGroup_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryItem` ADD CONSTRAINT `AccessoryItem_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryItem` ADD CONSTRAINT `AccessoryItem_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Color` ADD CONSTRAINT `Color_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UnitOfMeasurement` ADD CONSTRAINT `UnitOfMeasurement_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_deliveryPartyId_fkey` FOREIGN KEY (`deliveryPartyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_deliveryBranchId_fkey` FOREIGN KEY (`deliveryBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_RequirementPlanningItemsId_fkey` FOREIGN KEY (`RequirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_gaugeId_fkey` FOREIGN KEY (`gaugeId`) REFERENCES `Gauge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_loopLengthId_fkey` FOREIGN KEY (`loopLengthId`) REFERENCES `LoopLength`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_yarncategoryId_fkey` FOREIGN KEY (`yarncategoryId`) REFERENCES `YarnType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_kDiaId_fkey` FOREIGN KEY (`kDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_fDiaId_fkey` FOREIGN KEY (`fDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_count_fkey` FOREIGN KEY (`count`) REFERENCES `yarnCounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_deliveryPartyId_fkey` FOREIGN KEY (`deliveryPartyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_deliveryBranchId_fkey` FOREIGN KEY (`deliveryBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_RequirementPlanningItemsId_fkey` FOREIGN KEY (`RequirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPo` ADD CONSTRAINT `AccessoryPo_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_accessoryPoId_fkey` FOREIGN KEY (`accessoryPoId`) REFERENCES `AccessoryPo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_RequirementPlanningItemsId_fkey` FOREIGN KEY (`RequirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryPoItems` ADD CONSTRAINT `AccessoryPoItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PInwardOrReturn` ADD CONSTRAINT `PInwardOrReturn_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PInwardOrReturn` ADD CONSTRAINT `PInwardOrReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PInwardOrReturn` ADD CONSTRAINT `PInwardOrReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PInwardOrReturn` ADD CONSTRAINT `PInwardOrReturn_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PInwardOrReturn` ADD CONSTRAINT `PInwardOrReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoInwardReturnItems` ADD CONSTRAINT `PoInwardReturnItems_pInwardOrReturnId_fkey` FOREIGN KEY (`pInwardOrReturnId`) REFERENCES `PInwardOrReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoInwardReturnItems` ADD CONSTRAINT `PoInwardReturnItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `PoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `PoInwardReturnItems` ADD CONSTRAINT `PoInwardReturnItems_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_directInwardOrReturnId_fkey` FOREIGN KEY (`directInwardOrReturnId`) REFERENCES `DirectInwardOrReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_gaugeId_fkey` FOREIGN KEY (`gaugeId`) REFERENCES `Gauge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_loopLengthId_fkey` FOREIGN KEY (`loopLengthId`) REFERENCES `LoopLength`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_kDiaId_fkey` FOREIGN KEY (`kDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_fDiaId_fkey` FOREIGN KEY (`fDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `PoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectItems` ADD CONSTRAINT `DirectItems_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInward` ADD CONSTRAINT `AccessoryInward_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_AccessoryInwardId_fkey` FOREIGN KEY (`AccessoryInwardId`) REFERENCES `AccessoryInward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryInwardItems` ADD CONSTRAINT `AccessoryInwardItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `AccessoryPoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `PayTerm` ADD CONSTRAINT `PayTerm_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTerm` ADD CONSTRAINT `TaxTerm_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTemplate` ADD CONSTRAINT `TaxTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTemplateDetails` ADD CONSTRAINT `TaxTemplateDetails_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTemplateDetails` ADD CONSTRAINT `TaxTemplateDetails_taxTermId_fkey` FOREIGN KEY (`taxTermId`) REFERENCES `TaxTerm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gauge` ADD CONSTRAINT `Gauge_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Design` ADD CONSTRAINT `Design_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoopLength` ADD CONSTRAINT `LoopLength_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gsm` ADD CONSTRAINT `Gsm_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dia` ADD CONSTRAINT `Dia_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Size` ADD CONSTRAINT `Size_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocksMaterial` ADD CONSTRAINT `SocksMaterial_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplate` ADD CONSTRAINT `SizeTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplateOnSize` ADD CONSTRAINT `SizeTemplateOnSize_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplateOnSize` ADD CONSTRAINT `SizeTemplateOnSize_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_gaugeId_fkey` FOREIGN KEY (`gaugeId`) REFERENCES `Gauge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_loopLengthId_fkey` FOREIGN KEY (`loopLengthId`) REFERENCES `LoopLength`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_kDiaId_fkey` FOREIGN KEY (`kDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_fDiaId_fkey` FOREIGN KEY (`fDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_programInwardLotDetailsId_fkey` FOREIGN KEY (`programInwardLotDetailsId`) REFERENCES `ProgramInwardLotDetail`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_processDeliveryReturnRawMaterialDetailsId_fkey` FOREIGN KEY (`processDeliveryReturnRawMaterialDetailsId`) REFERENCES `ProcessDeliveryReturnRawMaterialDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_cuttingDeliveryDetailsId_fkey` FOREIGN KEY (`cuttingDeliveryDetailsId`) REFERENCES `CuttingDeliveryDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_cuttingExcessFabricReturnDetailsId_fkey` FOREIGN KEY (`cuttingExcessFabricReturnDetailsId`) REFERENCES `CuttingExcessFabricReturnDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_rawMaterialsSalesDetailsId_fkey` FOREIGN KEY (`rawMaterialsSalesDetailsId`) REFERENCES `RawMaterialsSalesDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_rawMaterialOpeningStockItemsId_fkey` FOREIGN KEY (`rawMaterialOpeningStockItemsId`) REFERENCES `RawMaterialOpeningStockItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_inwardLotDetailsId_fkey` FOREIGN KEY (`inwardLotDetailsId`) REFERENCES `InwardLotDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_accessoryInwardItemsId_fkey` FOREIGN KEY (`accessoryInwardItemsId`) REFERENCES `AccessoryInwardItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryStock` ADD CONSTRAINT `AccessoryStock_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Process` ADD CONSTRAINT `Process_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyOnProcess` ADD CONSTRAINT `PartyOnProcess_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyOnProcess` ADD CONSTRAINT `PartyOnProcess_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleOnColor` ADD CONSTRAINT `StyleOnColor_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleOnColor` ADD CONSTRAINT `StyleOnColor_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDelivery` ADD CONSTRAINT `ProcessDelivery_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDelivery` ADD CONSTRAINT `ProcessDelivery_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDelivery` ADD CONSTRAINT `ProcessDelivery_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDelivery` ADD CONSTRAINT `ProcessDelivery_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDelivery` ADD CONSTRAINT `ProcessDelivery_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDelivery` ADD CONSTRAINT `ProcessDelivery_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDelivery` ADD CONSTRAINT `ProcessDelivery_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_processDeliveryId_fkey` FOREIGN KEY (`processDeliveryId`) REFERENCES `ProcessDelivery`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_gaugeId_fkey` FOREIGN KEY (`gaugeId`) REFERENCES `Gauge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_loopLengthId_fkey` FOREIGN KEY (`loopLengthId`) REFERENCES `LoopLength`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_kDiaId_fkey` FOREIGN KEY (`kDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryProgramDetails` ADD CONSTRAINT `ProcessDeliveryProgramDetails_fDiaId_fkey` FOREIGN KEY (`fDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_processDeliveryProgramDetailsId_fkey` FOREIGN KEY (`processDeliveryProgramDetailsId`) REFERENCES `ProcessDeliveryProgramDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_gaugeId_fkey` FOREIGN KEY (`gaugeId`) REFERENCES `Gauge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_loopLengthId_fkey` FOREIGN KEY (`loopLengthId`) REFERENCES `LoopLength`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_kDiaId_fkey` FOREIGN KEY (`kDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_fDiaId_fkey` FOREIGN KEY (`fDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterials` ADD CONSTRAINT `RawMaterials_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessInward` ADD CONSTRAINT `ProcessInward_processDeliveryId_fkey` FOREIGN KEY (`processDeliveryId`) REFERENCES `ProcessDelivery`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessInward` ADD CONSTRAINT `ProcessInward_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessInward` ADD CONSTRAINT `ProcessInward_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessInward` ADD CONSTRAINT `ProcessInward_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessInward` ADD CONSTRAINT `ProcessInward_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessInwardProgramDetails` ADD CONSTRAINT `ProcessInwardProgramDetails_processInwardId_fkey` FOREIGN KEY (`processInwardId`) REFERENCES `ProcessInward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessInwardProgramDetails` ADD CONSTRAINT `ProcessInwardProgramDetails_processDeliveryProgramDetailsId_fkey` FOREIGN KEY (`processDeliveryProgramDetailsId`) REFERENCES `ProcessDeliveryProgramDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramInwardLotDetail` ADD CONSTRAINT `ProgramInwardLotDetail_processInwardProgramDetailsId_fkey` FOREIGN KEY (`processInwardProgramDetailsId`) REFERENCES `ProcessInwardProgramDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessInwardRawMaterialConsumptionDetails` ADD CONSTRAINT `ProcessInwardRawMaterialConsumptionDetails_processInwardPro_fkey` FOREIGN KEY (`processInwardProgramDetailsId`) REFERENCES `ProcessInwardProgramDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessInwardRawMaterialConsumptionDetails` ADD CONSTRAINT `ProcessInwardRawMaterialConsumptionDetails_rawMaterialsId_fkey` FOREIGN KEY (`rawMaterialsId`) REFERENCES `RawMaterials`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TermsAndConditions` ADD CONSTRAINT `TermsAndConditions_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TermsAndConditions` ADD CONSTRAINT `TermsAndConditions_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TermsAndConditions` ADD CONSTRAINT `TermsAndConditions_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrderDetails` ADD CONSTRAINT `CuttingOrderDetails_cuttingOrderId_fkey` FOREIGN KEY (`cuttingOrderId`) REFERENCES `CuttingOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrderDetails` ADD CONSTRAINT `CuttingOrderDetails_portionId_fkey` FOREIGN KEY (`portionId`) REFERENCES `Portion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrderDetails` ADD CONSTRAINT `CuttingOrderDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrderDetails` ADD CONSTRAINT `CuttingOrderDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrderDetails` ADD CONSTRAINT `CuttingOrderDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDelivery` ADD CONSTRAINT `CuttingDelivery_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDelivery` ADD CONSTRAINT `CuttingDelivery_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDelivery` ADD CONSTRAINT `CuttingDelivery_cuttingOrderId_fkey` FOREIGN KEY (`cuttingOrderId`) REFERENCES `CuttingOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDelivery` ADD CONSTRAINT `CuttingDelivery_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDelivery` ADD CONSTRAINT `CuttingDelivery_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDelivery` ADD CONSTRAINT `CuttingDelivery_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDelivery` ADD CONSTRAINT `CuttingDelivery_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_cuttingDeliveryId_fkey` FOREIGN KEY (`cuttingDeliveryId`) REFERENCES `CuttingDelivery`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_loopLengthId_fkey` FOREIGN KEY (`loopLengthId`) REFERENCES `LoopLength`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_kDiaId_fkey` FOREIGN KEY (`kDiaId`) REFERENCES `Dia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_gaugeId_fkey` FOREIGN KEY (`gaugeId`) REFERENCES `Gauge`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_fDiaId_fkey` FOREIGN KEY (`fDiaId`) REFERENCES `Dia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceipt` ADD CONSTRAINT `CuttingReceipt_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceipt` ADD CONSTRAINT `CuttingReceipt_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceipt` ADD CONSTRAINT `CuttingReceipt_cuttingOrderId_fkey` FOREIGN KEY (`cuttingOrderId`) REFERENCES `CuttingOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceipt` ADD CONSTRAINT `CuttingReceipt_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceipt` ADD CONSTRAINT `CuttingReceipt_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceipt` ADD CONSTRAINT `CuttingReceipt_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceipt` ADD CONSTRAINT `CuttingReceipt_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceiptInwardDetails` ADD CONSTRAINT `CuttingReceiptInwardDetails_cuttingReceiptId_fkey` FOREIGN KEY (`cuttingReceiptId`) REFERENCES `CuttingReceipt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceiptInwardDetails` ADD CONSTRAINT `CuttingReceiptInwardDetails_cuttingOrderDetailsId_fkey` FOREIGN KEY (`cuttingOrderDetailsId`) REFERENCES `CuttingOrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceiptFabricConsumptionDetails` ADD CONSTRAINT `CuttingReceiptFabricConsumptionDetails_cuttingReceiptId_fkey` FOREIGN KEY (`cuttingReceiptId`) REFERENCES `CuttingReceipt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceiptFabricConsumptionDetails` ADD CONSTRAINT `CuttingReceiptFabricConsumptionDetails_cuttingDeliveryDetai_fkey` FOREIGN KEY (`cuttingDeliveryDetailsId`) REFERENCES `CuttingDeliveryDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LossReason` ADD CONSTRAINT `LossReason_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceiptFabricLossDetails` ADD CONSTRAINT `CuttingReceiptFabricLossDetails_cuttingReceiptFabricConsump_fkey` FOREIGN KEY (`cuttingReceiptFabricConsumptionDetailsId`) REFERENCES `CuttingReceiptFabricConsumptionDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingReceiptFabricLossDetails` ADD CONSTRAINT `CuttingReceiptFabricLossDetails_lossReasonId_fkey` FOREIGN KEY (`lossReasonId`) REFERENCES `LossReason`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingExcessFabricReturn` ADD CONSTRAINT `CuttingExcessFabricReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingExcessFabricReturn` ADD CONSTRAINT `CuttingExcessFabricReturn_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingExcessFabricReturn` ADD CONSTRAINT `CuttingExcessFabricReturn_cuttingOrderId_fkey` FOREIGN KEY (`cuttingOrderId`) REFERENCES `CuttingOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingExcessFabricReturn` ADD CONSTRAINT `CuttingExcessFabricReturn_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingExcessFabricReturn` ADD CONSTRAINT `CuttingExcessFabricReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingExcessFabricReturn` ADD CONSTRAINT `CuttingExcessFabricReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingExcessFabricReturnDetails` ADD CONSTRAINT `CuttingExcessFabricReturnDetails_cuttingExcessFabricReturnI_fkey` FOREIGN KEY (`cuttingExcessFabricReturnId`) REFERENCES `CuttingExcessFabricReturn`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingExcessFabricReturnDetails` ADD CONSTRAINT `CuttingExcessFabricReturnDetails_cuttingDeliveryDetailsId_fkey` FOREIGN KEY (`cuttingDeliveryDetailsId`) REFERENCES `CuttingDeliveryDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_portionId_fkey` FOREIGN KEY (`portionId`) REFERENCES `Portion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_prevProcessId_fkey` FOREIGN KEY (`prevProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_cuttingReceiptInwardDetailsId_fkey` FOREIGN KEY (`cuttingReceiptInwardDetailsId`) REFERENCES `CuttingReceiptInwardDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_productionDeliveryDetailsId_fkey` FOREIGN KEY (`productionDeliveryDetailsId`) REFERENCES `ProductionDeliveryDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_productionReceiptDetailsId_fkey` FOREIGN KEY (`productionReceiptDetailsId`) REFERENCES `ProductionReceiptDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_finishedGoodsSalesDetailsId_fkey` FOREIGN KEY (`finishedGoodsSalesDetailsId`) REFERENCES `FinishedGoodsSalesDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_finishedGoodsOpeningStockDetailsId_fkey` FOREIGN KEY (`finishedGoodsOpeningStockDetailsId`) REFERENCES `FinishedGoodsOpeningStockDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_finishedGoodsSalesDeliveryDetailsId_fkey` FOREIGN KEY (`finishedGoodsSalesDeliveryDetailsId`) REFERENCES `FinishedGoodsSalesDeliveryDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_stockTransferFinishedGoodsDetailsId_fkey` FOREIGN KEY (`stockTransferFinishedGoodsDetailsId`) REFERENCES `StockTransferFinishedGoodsDeliveryDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_stockTransferFinishedGoodsReceiptDetailsId_fkey` FOREIGN KEY (`stockTransferFinishedGoodsReceiptDetailsId`) REFERENCES `StockTransferFinishedGoodsReceiptDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_onlineSalesDetailsId_fkey` FOREIGN KEY (`onlineSalesDetailsId`) REFERENCES `OnlineSalesDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockForPcs` ADD CONSTRAINT `StockForPcs_onlineSalesReturnDetailsId_fkey` FOREIGN KEY (`onlineSalesReturnDetailsId`) REFERENCES `OnlineSalesReturnDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_rawMaterialsSalesId_fkey` FOREIGN KEY (`rawMaterialsSalesId`) REFERENCES `RawMaterialsSales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_finishedGoodsSalesId_fkey` FOREIGN KEY (`finishedGoodsSalesId`) REFERENCES `FinishedGoodsSales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_printingJobWorkId_fkey` FOREIGN KEY (`printingJobWorkId`) REFERENCES `PrintingJobWork`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntryItems` ADD CONSTRAINT `BillEntryItems_billEntryId_fkey` FOREIGN KEY (`billEntryId`) REFERENCES `BillEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntryItems` ADD CONSTRAINT `BillEntryItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `PoItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntryItems` ADD CONSTRAINT `BillEntryItems_directItemsId_fkey` FOREIGN KEY (`directItemsId`) REFERENCES `DirectItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntryItems` ADD CONSTRAINT `BillEntryItems_processDeliveryProgramDetailsId_fkey` FOREIGN KEY (`processDeliveryProgramDetailsId`) REFERENCES `ProcessDeliveryProgramDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntryItems` ADD CONSTRAINT `BillEntryItems_accessoryInwardItemsId_fkey` FOREIGN KEY (`accessoryInwardItemsId`) REFERENCES `AccessoryInwardItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntry` ADD CONSTRAINT `AccessoryBillEntry_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntryItems` ADD CONSTRAINT `AccessoryBillEntryItems_accessoryBillEntryId_fkey` FOREIGN KEY (`accessoryBillEntryId`) REFERENCES `AccessoryBillEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntryItems` ADD CONSTRAINT `AccessoryBillEntryItems_accessoryPoItemsId_fkey` FOREIGN KEY (`accessoryPoItemsId`) REFERENCES `AccessoryPoItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntryItems` ADD CONSTRAINT `AccessoryBillEntryItems_accessoryInwardItemsId_fkey` FOREIGN KEY (`accessoryInwardItemsId`) REFERENCES `AccessoryInwardItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryBillEntryItems` ADD CONSTRAINT `AccessoryBillEntryItems_processDeliveryProgramDetailsId_fkey` FOREIGN KEY (`processDeliveryProgramDetailsId`) REFERENCES `ProcessDeliveryProgramDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payout` ADD CONSTRAINT `Payout_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payout` ADD CONSTRAINT `Payout_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payout` ADD CONSTRAINT `Payout_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payout` ADD CONSTRAINT `Payout_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayOutItems` ADD CONSTRAINT `PayOutItems_payoutId_fkey` FOREIGN KEY (`payoutId`) REFERENCES `Payout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayOutItems` ADD CONSTRAINT `PayOutItems_billEntryId_fkey` FOREIGN KEY (`billEntryId`) REFERENCES `BillEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvanceAdjustMent` ADD CONSTRAINT `AdvanceAdjustMent_advancePayOutId_fkey` FOREIGN KEY (`advancePayOutId`) REFERENCES `Payout`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvanceAdjustMent` ADD CONSTRAINT `AdvanceAdjustMent_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvanceAdjustMent` ADD CONSTRAINT `AdvanceAdjustMent_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvanceAdjustMent` ADD CONSTRAINT `AdvanceAdjustMent_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvanceAdjustDetails` ADD CONSTRAINT `AdvanceAdjustDetails_advanceAdjustMentId_fkey` FOREIGN KEY (`advanceAdjustMentId`) REFERENCES `AdvanceAdjustMent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvanceAdjustDetails` ADD CONSTRAINT `AdvanceAdjustDetails_billEntryId_fkey` FOREIGN KEY (`billEntryId`) REFERENCES `BillEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_billEntryId_fkey` FOREIGN KEY (`billEntryId`) REFERENCES `BillEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_payoutId_fkey` FOREIGN KEY (`payoutId`) REFERENCES `Payout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_creditDebitNoteId_fkey` FOREIGN KEY (`creditDebitNoteId`) REFERENCES `CreditDebitNote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryReturn` ADD CONSTRAINT `ProcessDeliveryReturn_processDeliveryId_fkey` FOREIGN KEY (`processDeliveryId`) REFERENCES `ProcessDelivery`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryReturn` ADD CONSTRAINT `ProcessDeliveryReturn_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryReturn` ADD CONSTRAINT `ProcessDeliveryReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryReturn` ADD CONSTRAINT `ProcessDeliveryReturn_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryReturn` ADD CONSTRAINT `ProcessDeliveryReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryReturnProgramDetails` ADD CONSTRAINT `ProcessDeliveryReturnProgramDetails_processDeliveryReturnId_fkey` FOREIGN KEY (`processDeliveryReturnId`) REFERENCES `ProcessDeliveryReturn`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryReturnProgramDetails` ADD CONSTRAINT `ProcessDeliveryReturnProgramDetails_processDeliveryProgramD_fkey` FOREIGN KEY (`processDeliveryProgramDetailsId`) REFERENCES `ProcessDeliveryProgramDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryReturnRawMaterialDetails` ADD CONSTRAINT `ProcessDeliveryReturnRawMaterialDetails_processDeliveryRetu_fkey` FOREIGN KEY (`processDeliveryReturnProgramDetailsId`) REFERENCES `ProcessDeliveryReturnProgramDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessDeliveryReturnRawMaterialDetails` ADD CONSTRAINT `ProcessDeliveryReturnRawMaterialDetails_rawMaterialsId_fkey` FOREIGN KEY (`rawMaterialsId`) REFERENCES `RawMaterials`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDelivery` ADD CONSTRAINT `ProductionDelivery_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDelivery` ADD CONSTRAINT `ProductionDelivery_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDelivery` ADD CONSTRAINT `ProductionDelivery_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDelivery` ADD CONSTRAINT `ProductionDelivery_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDelivery` ADD CONSTRAINT `ProductionDelivery_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDelivery` ADD CONSTRAINT `ProductionDelivery_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDelivery` ADD CONSTRAINT `ProductionDelivery_fromProcessId_fkey` FOREIGN KEY (`fromProcessId`) REFERENCES `Process`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDelivery` ADD CONSTRAINT `ProductionDelivery_toProcessId_fkey` FOREIGN KEY (`toProcessId`) REFERENCES `Process`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDelivery` ADD CONSTRAINT `ProductionDelivery_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDeliveryDetails` ADD CONSTRAINT `ProductionDeliveryDetails_productionDeliveryId_fkey` FOREIGN KEY (`productionDeliveryId`) REFERENCES `ProductionDelivery`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDeliveryDetails` ADD CONSTRAINT `ProductionDeliveryDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDeliveryDetails` ADD CONSTRAINT `ProductionDeliveryDetails_portionId_fkey` FOREIGN KEY (`portionId`) REFERENCES `Portion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDeliveryDetails` ADD CONSTRAINT `ProductionDeliveryDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDeliveryDetails` ADD CONSTRAINT `ProductionDeliveryDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDeliveryDetails` ADD CONSTRAINT `ProductionDeliveryDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionDeliveryDetails` ADD CONSTRAINT `ProductionDeliveryDetails_prevProcessId_fkey` FOREIGN KEY (`prevProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceipt` ADD CONSTRAINT `ProductionReceipt_prevProcessId_fkey` FOREIGN KEY (`prevProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceipt` ADD CONSTRAINT `ProductionReceipt_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceipt` ADD CONSTRAINT `ProductionReceipt_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceipt` ADD CONSTRAINT `ProductionReceipt_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceipt` ADD CONSTRAINT `ProductionReceipt_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceipt` ADD CONSTRAINT `ProductionReceipt_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceipt` ADD CONSTRAINT `ProductionReceipt_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceipt` ADD CONSTRAINT `ProductionReceipt_productionDeliveryId_fkey` FOREIGN KEY (`productionDeliveryId`) REFERENCES `ProductionDelivery`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceipt` ADD CONSTRAINT `ProductionReceipt_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceiptDetails` ADD CONSTRAINT `ProductionReceiptDetails_productionReceiptId_fkey` FOREIGN KEY (`productionReceiptId`) REFERENCES `ProductionReceipt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceiptDetails` ADD CONSTRAINT `ProductionReceiptDetails_productionDeliveryDetailsId_fkey` FOREIGN KEY (`productionDeliveryDetailsId`) REFERENCES `ProductionDeliveryDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceiptLossDetails` ADD CONSTRAINT `ProductionReceiptLossDetails_productionReceiptDetailsId_fkey` FOREIGN KEY (`productionReceiptDetailsId`) REFERENCES `ProductionReceiptDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionReceiptLossDetails` ADD CONSTRAINT `ProductionReceiptLossDetails_lossReasonId_fkey` FOREIGN KEY (`lossReasonId`) REFERENCES `LossReason`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSales` ADD CONSTRAINT `RawMaterialsSales_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSales` ADD CONSTRAINT `RawMaterialsSales_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSales` ADD CONSTRAINT `RawMaterialsSales_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSales` ADD CONSTRAINT `RawMaterialsSales_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSales` ADD CONSTRAINT `RawMaterialsSales_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSales` ADD CONSTRAINT `RawMaterialsSales_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSales` ADD CONSTRAINT `RawMaterialsSales_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSales` ADD CONSTRAINT `RawMaterialsSales_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_rawMaterialsSalesId_fkey` FOREIGN KEY (`rawMaterialsSalesId`) REFERENCES `RawMaterialsSales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_gaugeId_fkey` FOREIGN KEY (`gaugeId`) REFERENCES `Gauge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_loopLengthId_fkey` FOREIGN KEY (`loopLengthId`) REFERENCES `LoopLength`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_kDiaId_fkey` FOREIGN KEY (`kDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_fDiaId_fkey` FOREIGN KEY (`fDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialsSalesDetails` ADD CONSTRAINT `RawMaterialsSalesDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSales` ADD CONSTRAINT `FinishedGoodsSales_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSales` ADD CONSTRAINT `FinishedGoodsSales_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSales` ADD CONSTRAINT `FinishedGoodsSales_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSales` ADD CONSTRAINT `FinishedGoodsSales_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSales` ADD CONSTRAINT `FinishedGoodsSales_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSales` ADD CONSTRAINT `FinishedGoodsSales_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDetails` ADD CONSTRAINT `FinishedGoodsSalesDetails_finishedGoodsSalesId_fkey` FOREIGN KEY (`finishedGoodsSalesId`) REFERENCES `FinishedGoodsSales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDetails` ADD CONSTRAINT `FinishedGoodsSalesDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDetails` ADD CONSTRAINT `FinishedGoodsSalesDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDetails` ADD CONSTRAINT `FinishedGoodsSalesDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDetails` ADD CONSTRAINT `FinishedGoodsSalesDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDetails` ADD CONSTRAINT `FinishedGoodsSalesDetails_prevProcessId_fkey` FOREIGN KEY (`prevProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDetails` ADD CONSTRAINT `FinishedGoodsSalesDetails_finishedGoodsSalesDeliveryDetails_fkey` FOREIGN KEY (`finishedGoodsSalesDeliveryDetailsId`) REFERENCES `FinishedGoodsSalesDeliveryDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStock` ADD CONSTRAINT `RawMaterialOpeningStock_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStock` ADD CONSTRAINT `RawMaterialOpeningStock_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStock` ADD CONSTRAINT `RawMaterialOpeningStock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStock` ADD CONSTRAINT `RawMaterialOpeningStock_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_rawMaterialOpeningStockId_fkey` FOREIGN KEY (`rawMaterialOpeningStockId`) REFERENCES `RawMaterialOpeningStock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_prevProcessId_fkey` FOREIGN KEY (`prevProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_gaugeId_fkey` FOREIGN KEY (`gaugeId`) REFERENCES `Gauge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_loopLengthId_fkey` FOREIGN KEY (`loopLengthId`) REFERENCES `LoopLength`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_kDiaId_fkey` FOREIGN KEY (`kDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterialOpeningStockItems` ADD CONSTRAINT `RawMaterialOpeningStockItems_fDiaId_fkey` FOREIGN KEY (`fDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsOpeningStock` ADD CONSTRAINT `FinishedGoodsOpeningStock_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsOpeningStock` ADD CONSTRAINT `FinishedGoodsOpeningStock_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsOpeningStock` ADD CONSTRAINT `FinishedGoodsOpeningStock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsOpeningStock` ADD CONSTRAINT `FinishedGoodsOpeningStock_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsOpeningStock` ADD CONSTRAINT `FinishedGoodsOpeningStock_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsOpeningStockDetails` ADD CONSTRAINT `FinishedGoodsOpeningStockDetails_finishedGoodsOpeningStockI_fkey` FOREIGN KEY (`finishedGoodsOpeningStockId`) REFERENCES `FinishedGoodsOpeningStock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsOpeningStockDetails` ADD CONSTRAINT `FinishedGoodsOpeningStockDetails_prevProcessId_fkey` FOREIGN KEY (`prevProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsOpeningStockDetails` ADD CONSTRAINT `FinishedGoodsOpeningStockDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsOpeningStockDetails` ADD CONSTRAINT `FinishedGoodsOpeningStockDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsOpeningStockDetails` ADD CONSTRAINT `FinishedGoodsOpeningStockDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Portion` ADD CONSTRAINT `Portion_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleOnPortion` ADD CONSTRAINT `StyleOnPortion_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleOnPortion` ADD CONSTRAINT `StyleOnPortion_portionId_fkey` FOREIGN KEY (`portionId`) REFERENCES `Portion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDelivery` ADD CONSTRAINT `FinishedGoodsSalesDelivery_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDelivery` ADD CONSTRAINT `FinishedGoodsSalesDelivery_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDelivery` ADD CONSTRAINT `FinishedGoodsSalesDelivery_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDelivery` ADD CONSTRAINT `FinishedGoodsSalesDelivery_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDelivery` ADD CONSTRAINT `FinishedGoodsSalesDelivery_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDeliveryDetails` ADD CONSTRAINT `FinishedGoodsSalesDeliveryDetails_finishedGoodsSalesDeliver_fkey` FOREIGN KEY (`finishedGoodsSalesDeliveryId`) REFERENCES `FinishedGoodsSalesDelivery`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDeliveryDetails` ADD CONSTRAINT `FinishedGoodsSalesDeliveryDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDeliveryDetails` ADD CONSTRAINT `FinishedGoodsSalesDeliveryDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDeliveryDetails` ADD CONSTRAINT `FinishedGoodsSalesDeliveryDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDeliveryDetails` ADD CONSTRAINT `FinishedGoodsSalesDeliveryDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinishedGoodsSalesDeliveryDetails` ADD CONSTRAINT `FinishedGoodsSalesDeliveryDetails_prevProcessId_fkey` FOREIGN KEY (`prevProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoods` ADD CONSTRAINT `StockTransferFinishedGoods_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoods` ADD CONSTRAINT `StockTransferFinishedGoods_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoods` ADD CONSTRAINT `StockTransferFinishedGoods_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoods` ADD CONSTRAINT `StockTransferFinishedGoods_deliveryToBranchId_fkey` FOREIGN KEY (`deliveryToBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoods` ADD CONSTRAINT `StockTransferFinishedGoods_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoods` ADD CONSTRAINT `StockTransferFinishedGoods_prevDeliveryId_fkey` FOREIGN KEY (`prevDeliveryId`) REFERENCES `StockTransferFinishedGoods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsDeliveryDetails` ADD CONSTRAINT `StockTransferFinishedGoodsDeliveryDetails_stockTransferFini_fkey` FOREIGN KEY (`stockTransferFinishedGoodsId`) REFERENCES `StockTransferFinishedGoods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsDeliveryDetails` ADD CONSTRAINT `StockTransferFinishedGoodsDeliveryDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsDeliveryDetails` ADD CONSTRAINT `StockTransferFinishedGoodsDeliveryDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsDeliveryDetails` ADD CONSTRAINT `StockTransferFinishedGoodsDeliveryDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsDeliveryDetails` ADD CONSTRAINT `StockTransferFinishedGoodsDeliveryDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsDeliveryDetails` ADD CONSTRAINT `StockTransferFinishedGoodsDeliveryDetails_prevProcessId_fkey` FOREIGN KEY (`prevProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsReceiptDetails` ADD CONSTRAINT `StockTransferFinishedGoodsReceiptDetails_stockTransferFinis_fkey` FOREIGN KEY (`stockTransferFinishedGoodsId`) REFERENCES `StockTransferFinishedGoods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsReceiptDetails` ADD CONSTRAINT `StockTransferFinishedGoodsReceiptDetails_stockTransferDeliv_fkey` FOREIGN KEY (`stockTransferDeliveryDetailsId`) REFERENCES `StockTransferFinishedGoodsDeliveryDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsReceiptDetails` ADD CONSTRAINT `StockTransferFinishedGoodsReceiptDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsReceiptDetails` ADD CONSTRAINT `StockTransferFinishedGoodsReceiptDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsReceiptDetails` ADD CONSTRAINT `StockTransferFinishedGoodsReceiptDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsReceiptDetails` ADD CONSTRAINT `StockTransferFinishedGoodsReceiptDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransferFinishedGoodsReceiptDetails` ADD CONSTRAINT `StockTransferFinishedGoodsReceiptDetails_prevProcessId_fkey` FOREIGN KEY (`prevProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceTemplate` ADD CONSTRAINT `PriceTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceTemplateStyleWiseDetails` ADD CONSTRAINT `PriceTemplateStyleWiseDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceTemplateStyleWiseDetails` ADD CONSTRAINT `PriceTemplateStyleWiseDetails_priceTemplateId_fkey` FOREIGN KEY (`priceTemplateId`) REFERENCES `PriceTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceTemplateStyleSizeDetails` ADD CONSTRAINT `PriceTemplateStyleSizeDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceTemplateStyleSizeDetails` ADD CONSTRAINT `PriceTemplateStyleSizeDetails_PriceTemplateStyleWiseDetails_fkey` FOREIGN KEY (`PriceTemplateStyleWiseDetailsId`) REFERENCES `PriceTemplateStyleWiseDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrintingJobWork` ADD CONSTRAINT `PrintingJobWork_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrintingJobWork` ADD CONSTRAINT `PrintingJobWork_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrintingJobWork` ADD CONSTRAINT `PrintingJobWork_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrintingJobWork` ADD CONSTRAINT `PrintingJobWork_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrintingJobWork` ADD CONSTRAINT `PrintingJobWork_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrintingJobWorkDet` ADD CONSTRAINT `PrintingJobWorkDet_printingJobWorkId_fkey` FOREIGN KEY (`printingJobWorkId`) REFERENCES `PrintingJobWork`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrintingJobWorkDet` ADD CONSTRAINT `PrintingJobWorkDet_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrintingJobWorkDet` ADD CONSTRAINT `PrintingJobWorkDet_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSales` ADD CONSTRAINT `OnlineSales_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSales` ADD CONSTRAINT `OnlineSales_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSales` ADD CONSTRAINT `OnlineSales_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSales` ADD CONSTRAINT `OnlineSales_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSales` ADD CONSTRAINT `OnlineSales_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesDetails` ADD CONSTRAINT `OnlineSalesDetails_onlineSalesId_fkey` FOREIGN KEY (`onlineSalesId`) REFERENCES `OnlineSales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesDetails` ADD CONSTRAINT `OnlineSalesDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesDetails` ADD CONSTRAINT `OnlineSalesDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesDetails` ADD CONSTRAINT `OnlineSalesDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesDetails` ADD CONSTRAINT `OnlineSalesDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesDetails` ADD CONSTRAINT `OnlineSalesDetails_prevProcessId_fkey` FOREIGN KEY (`prevProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesReturn` ADD CONSTRAINT `OnlineSalesReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesReturn` ADD CONSTRAINT `OnlineSalesReturn_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesReturn` ADD CONSTRAINT `OnlineSalesReturn_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesReturn` ADD CONSTRAINT `OnlineSalesReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesReturn` ADD CONSTRAINT `OnlineSalesReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesReturnDetails` ADD CONSTRAINT `OnlineSalesReturnDetails_onlineSalesReturnId_fkey` FOREIGN KEY (`onlineSalesReturnId`) REFERENCES `OnlineSalesReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnlineSalesReturnDetails` ADD CONSTRAINT `OnlineSalesReturnDetails_onlineSalesDetailsId_fkey` FOREIGN KEY (`onlineSalesDetailsId`) REFERENCES `OnlineSalesDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditDebitNote` ADD CONSTRAINT `CreditDebitNote_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditDebitNote` ADD CONSTRAINT `CreditDebitNote_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditDebitNote` ADD CONSTRAINT `CreditDebitNote_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditDebitNote` ADD CONSTRAINT `CreditDebitNote_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditDebitNote` ADD CONSTRAINT `CreditDebitNote_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_yarnNeedleId_fkey` FOREIGN KEY (`yarnNeedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_fiberContentId_fkey` FOREIGN KEY (`fiberContentId`) REFERENCES `FiberContent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_socksMaterialId_fkey` FOREIGN KEY (`socksMaterialId`) REFERENCES `SocksMaterial`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_baseColorId_fkey` FOREIGN KEY (`baseColorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_socksTypeId_fkey` FOREIGN KEY (`socksTypeId`) REFERENCES `SocksType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderSizeDetails` ADD CONSTRAINT `orderSizeDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderSizeDetails` ADD CONSTRAINT `orderSizeDetails_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderSizeDetails` ADD CONSTRAINT `orderSizeDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_yarncategoryId_fkey` FOREIGN KEY (`yarncategoryId`) REFERENCES `YarnType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_count_fkey` FOREIGN KEY (`count`) REFERENCES `yarnCounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_yarnKneedleId_fkey` FOREIGN KEY (`yarnKneedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderYarnDetails` ADD CONSTRAINT `orderYarnDetails_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShippingAddress` ADD CONSTRAINT `ShippingAddress_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactDetails` ADD CONSTRAINT `ContactDetails_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocksType` ADD CONSTRAINT `SocksType_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Measurement` ADD CONSTRAINT `Measurement_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiberContent` ADD CONSTRAINT `FiberContent_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiberBlend` ADD CONSTRAINT `FiberBlend_fiberContentId_fkey` FOREIGN KEY (`fiberContentId`) REFERENCES `FiberContent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiberBlend` ADD CONSTRAINT `FiberBlend_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnNeedle` ADD CONSTRAINT `YarnNeedle_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_yarnNeedleId_fkey` FOREIGN KEY (`yarnNeedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_fiberContentId_fkey` FOREIGN KEY (`fiberContentId`) REFERENCES `FiberContent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_socksMaterialId_fkey` FOREIGN KEY (`socksMaterialId`) REFERENCES `SocksMaterial`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_footcolorId_fkey` FOREIGN KEY (`footcolorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_stripecolorId_fkey` FOREIGN KEY (`stripecolorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleDetails` ADD CONSTRAINT `sampleDetails_socksTypeId_fkey` FOREIGN KEY (`socksTypeId`) REFERENCES `SocksType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_sampleDetailsId_fkey` FOREIGN KEY (`sampleDetailsId`) REFERENCES `sampleDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_yarnNeedleId_fkey` FOREIGN KEY (`yarnNeedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleSizeDetails` ADD CONSTRAINT `sampleSizeDetails_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleYarnDetails` ADD CONSTRAINT `sampleYarnDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleYarnDetails` ADD CONSTRAINT `sampleYarnDetails_sampleDetailsId_fkey` FOREIGN KEY (`sampleDetailsId`) REFERENCES `sampleDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningForm` ADD CONSTRAINT `RequirementPlanningForm_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_count_fkey` FOREIGN KEY (`count`) REFERENCES `yarnCounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningItems` ADD CONSTRAINT `RequirementPlanningItems_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementSizeDetails` ADD CONSTRAINT `RequirementSizeDetails_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementSizeDetails` ADD CONSTRAINT `RequirementSizeDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementSizeDetails` ADD CONSTRAINT `RequirementSizeDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementSizeDetails` ADD CONSTRAINT `RequirementSizeDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementSizeDetails` ADD CONSTRAINT `RequirementSizeDetails_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_RequirementPlanningId_fkey` FOREIGN KEY (`RequirementPlanningId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_yarncategoryId_fkey` FOREIGN KEY (`yarncategoryId`) REFERENCES `YarnType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_count_fkey` FOREIGN KEY (`count`) REFERENCES `yarnCounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_yarnKneedleId_fkey` FOREIGN KEY (`yarnKneedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnDetails` ADD CONSTRAINT `RequirementYarnDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnProcessList` ADD CONSTRAINT `RequirementYarnProcessList_requirementYarnDetailsId_fkey` FOREIGN KEY (`requirementYarnDetailsId`) REFERENCES `RequirementYarnDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementYarnProcessList` ADD CONSTRAINT `RequirementYarnProcessList_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningProcessList` ADD CONSTRAINT `RequirementPlanningProcessList_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementPlanningProcessList` ADD CONSTRAINT `RequirementPlanningProcessList_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_RequirementPlanningId_fkey` FOREIGN KEY (`RequirementPlanningId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRequirementPlanning` ADD CONSTRAINT `AccessoryRequirementPlanning_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndent` ADD CONSTRAINT `RaiseIndent_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialTypeList` ADD CONSTRAINT `MaterialTypeList_raiseIndentId_fkey` FOREIGN KEY (`raiseIndentId`) REFERENCES `RaiseIndent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_raiseIndentId_fkey` FOREIGN KEY (`raiseIndentId`) REFERENCES `RaiseIndent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndenetYarnItems` ADD CONSTRAINT `RaiseIndenetYarnItems_raiseIndentItemsId_fkey` FOREIGN KEY (`raiseIndentItemsId`) REFERENCES `RaiseIndentItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndenetYarnItems` ADD CONSTRAINT `RaiseIndenetYarnItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndenetYarnItems` ADD CONSTRAINT `RaiseIndenetYarnItems_yarnNeedleId_fkey` FOREIGN KEY (`yarnNeedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndenetYarnItems` ADD CONSTRAINT `RaiseIndenetYarnItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndenetYarnItems` ADD CONSTRAINT `RaiseIndenetYarnItems_requirementPlanningId_fkey` FOREIGN KEY (`requirementPlanningId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaiseIndenetYarnItems` ADD CONSTRAINT `RaiseIndenetYarnItems_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_raiseIndentId_fkey` FOREIGN KEY (`raiseIndentId`) REFERENCES `RaiseIndent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryRaiseIndentItems` ADD CONSTRAINT `AccessoryRaiseIndentItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssue` ADD CONSTRAINT `MaterialIssue_raiseIndentId_fkey` FOREIGN KEY (`raiseIndentId`) REFERENCES `RaiseIndent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_materialIssueId_fkey` FOREIGN KEY (`materialIssueId`) REFERENCES `MaterialIssue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_raiseIndentId_fkey` FOREIGN KEY (`raiseIndentId`) REFERENCES `RaiseIndent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_raiseIndentItemsId_fkey` FOREIGN KEY (`raiseIndentItemsId`) REFERENCES `RaiseIndentItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_materialIssueId_fkey` FOREIGN KEY (`materialIssueId`) REFERENCES `MaterialIssue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_requirementPlanningFormId_fkey` FOREIGN KEY (`requirementPlanningFormId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_raiseIndentId_fkey` FOREIGN KEY (`raiseIndentId`) REFERENCES `RaiseIndent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_accessoryRaiseIndentItemsId_fkey` FOREIGN KEY (`accessoryRaiseIndentItemsId`) REFERENCES `AccessoryRaiseIndentItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryMaterialIssueItems` ADD CONSTRAINT `AccessoryMaterialIssueItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueTypeList` ADD CONSTRAINT `MaterialIssueTypeList_materialIssueId_fkey` FOREIGN KEY (`materialIssueId`) REFERENCES `MaterialIssue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_materialIssueItemsId_fkey` FOREIGN KEY (`materialIssueItemsId`) REFERENCES `MaterialIssueItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_yarnNeedleId_fkey` FOREIGN KEY (`yarnNeedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_requirementPlanningId_fkey` FOREIGN KEY (`requirementPlanningId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueYarnItems` ADD CONSTRAINT `MaterialIssueYarnItems_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransfer` ADD CONSTRAINT `StockTransfer_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransfer` ADD CONSTRAINT `StockTransfer_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransfer` ADD CONSTRAINT `StockTransfer_fromOrderId_fkey` FOREIGN KEY (`fromOrderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransfer` ADD CONSTRAINT `StockTransfer_toOrderId_fkey` FOREIGN KEY (`toOrderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_stockTransferId_fkey` FOREIGN KEY (`stockTransferId`) REFERENCES `StockTransfer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromOrderTransferItems` ADD CONSTRAINT `FromOrderTransferItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToOrderTransferTtems` ADD CONSTRAINT `ToOrderTransferTtems_stockTransferId_fkey` FOREIGN KEY (`stockTransferId`) REFERENCES `StockTransfer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToOrderTransferTtems` ADD CONSTRAINT `ToOrderTransferTtems_RequirementPlanningId_fkey` FOREIGN KEY (`RequirementPlanningId`) REFERENCES `RequirementPlanningForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToOrderTransferTtems` ADD CONSTRAINT `ToOrderTransferTtems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToOrderTransferTtems` ADD CONSTRAINT `ToOrderTransferTtems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToOrderTransferTtems` ADD CONSTRAINT `ToOrderTransferTtems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoyStockTransfer` ADD CONSTRAINT `AccessoyStockTransfer_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoyStockTransfer` ADD CONSTRAINT `AccessoyStockTransfer_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoyStockTransfer` ADD CONSTRAINT `AccessoyStockTransfer_fromOrderId_fkey` FOREIGN KEY (`fromOrderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoyStockTransfer` ADD CONSTRAINT `AccessoyStockTransfer_toOrderId_fkey` FOREIGN KEY (`toOrderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_stockTransferId_fkey` FOREIGN KEY (`stockTransferId`) REFERENCES `AccessoyStockTransfer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FromAccessoryTransferItems` ADD CONSTRAINT `FromAccessoryTransferItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_stockTransferId_fkey` FOREIGN KEY (`stockTransferId`) REFERENCES `AccessoyStockTransfer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToAccessoryTransferItems` ADD CONSTRAINT `ToAccessoryTransferItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnOrPoReturn` ADD CONSTRAINT `DirectReturnOrPoReturn_orderdetailsId_fkey` FOREIGN KEY (`orderdetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_directReturnOrPoReturnId_fkey` FOREIGN KEY (`directReturnOrPoReturnId`) REFERENCES `DirectReturnOrPoReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_gaugeId_fkey` FOREIGN KEY (`gaugeId`) REFERENCES `Gauge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_loopLengthId_fkey` FOREIGN KEY (`loopLengthId`) REFERENCES `LoopLength`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_kDiaId_fkey` FOREIGN KEY (`kDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_fDiaId_fkey` FOREIGN KEY (`fDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `PoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_directItemsId_fkey` FOREIGN KEY (`directItemsId`) REFERENCES `DirectItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_accessoryInwardItemsId_fkey` FOREIGN KEY (`accessoryInwardItemsId`) REFERENCES `AccessoryInwardItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectReturnItems` ADD CONSTRAINT `DirectReturnItems_requirementPlanningItemsId_fkey` FOREIGN KEY (`requirementPlanningItemsId`) REFERENCES `RequirementPlanningItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturn` ADD CONSTRAINT `AccessoryReturn_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryReturnId_fkey` FOREIGN KEY (`accessoryReturnId`) REFERENCES `AccessoryReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryPoItemsId_fkey` FOREIGN KEY (`accessoryPoItemsId`) REFERENCES `AccessoryPoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryInwardItemsId_fkey` FOREIGN KEY (`accessoryInwardItemsId`) REFERENCES `AccessoryInwardItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryReturnItems` ADD CONSTRAINT `AccessoryReturnItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnLotDetails` ADD CONSTRAINT `ReturnLotDetails_directReturnItemsId_fkey` FOREIGN KEY (`directReturnItemsId`) REFERENCES `DirectReturnItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnLotDetails` ADD CONSTRAINT `ReturnLotDetails_accessoryReturnItemsId_fkey` FOREIGN KEY (`accessoryReturnItemsId`) REFERENCES `AccessoryReturnItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_purchaseCancelId_fkey` FOREIGN KEY (`purchaseCancelId`) REFERENCES `PurchaseCancel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_gaugeId_fkey` FOREIGN KEY (`gaugeId`) REFERENCES `Gauge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_loopLengthId_fkey` FOREIGN KEY (`loopLengthId`) REFERENCES `LoopLength`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_kDiaId_fkey` FOREIGN KEY (`kDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_fDiaId_fkey` FOREIGN KEY (`fDiaId`) REFERENCES `Dia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `PoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_cancelItems_fkey` FOREIGN KEY (`cancelItems`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelItems` ADD CONSTRAINT `CancelItems_accessoryRequirementPlanningId_fkey` FOREIGN KEY (`accessoryRequirementPlanningId`) REFERENCES `AccessoryRequirementPlanning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccesssoryPurchaseCancel` ADD CONSTRAINT `AccesssoryPurchaseCancel_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccesssoryPurchaseCancel` ADD CONSTRAINT `AccesssoryPurchaseCancel_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccesssoryPurchaseCancel` ADD CONSTRAINT `AccesssoryPurchaseCancel_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccesssoryPurchaseCancel` ADD CONSTRAINT `AccesssoryPurchaseCancel_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_accesssoryPurchaseCancelId_fkey` FOREIGN KEY (`accesssoryPurchaseCancelId`) REFERENCES `AccesssoryPurchaseCancel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCancelItems` ADD CONSTRAINT `AccessoryCancelItems_poItemsId_fkey` FOREIGN KEY (`poItemsId`) REFERENCES `AccessoryPoItems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `InwardLotDetails` ADD CONSTRAINT `InwardLotDetails_directItemsId_fkey` FOREIGN KEY (`directItemsId`) REFERENCES `DirectItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardLotDetails` ADD CONSTRAINT `InwardLotDetails_accessoryInwardItemsId_fkey` FOREIGN KEY (`accessoryInwardItemsId`) REFERENCES `AccessoryInwardItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawMaterial` ADD CONSTRAINT `RawMaterial_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchType` ADD CONSTRAINT `BranchType_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExcessToleranceItems` ADD CONSTRAINT `ExcessToleranceItems_excessToleranceId_fkey` FOREIGN KEY (`excessToleranceId`) REFERENCES `ExcessTolerance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DirectItemsToStock` ADD CONSTRAINT `_DirectItemsToStock_A_fkey` FOREIGN KEY (`A`) REFERENCES `DirectItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DirectItemsToStock` ADD CONSTRAINT `_DirectItemsToStock_B_fkey` FOREIGN KEY (`B`) REFERENCES `Stock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
