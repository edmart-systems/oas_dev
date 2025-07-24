import { UserService } from "@/services/user-service/user.service";
import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const main = async () => {
  const userService = new UserService();

  const roleTable: Prisma.BatchPayload = await prisma.role.createMany({
    data: [
      {
        role_id: 1,
        role: "manager",
        role_desc: "Person that oversees employees",
      },
      {
        role_id: 2,
        role: "employee",
        role_desc: "Person employed by the firm",
      },
    ],
  });

  const statusTable: Prisma.BatchPayload = await prisma.status.createMany({
    data: [
      {
        status_id: 1,
        status: "active",
        status_desc: "Actively working user account",
      },
      {
        status_id: 2,
        status: "blocked",
        status_desc: "User account temporarily suspended",
      },
      {
        status_id: 3,
        status: "pending",
        status_desc: "User account pending activation",
      },
      {
        status_id: 4,
        status: "inactive",
        status_desc: "Employee no longer with the company",
      },
    ],
  });

  const userTable: Prisma.BatchPayload = await prisma.user.createMany({
    data: [
      {
        co_user_id: await userService.generateCompanyId({
          firstTime: false,
        }),
        firstName: "Usaama",
        lastName: "Nkangi",
        email: "se.usaama@edmartsystems.com",
        email_verified: 1,
        phone_number: "+256750781781",
        phone_verified: 1,
        hash: "",
        profile_picture:
          "https://avatars.githubusercontent.com/u/81554809?s=400&u=cec5338883a3e0431fbfadea3e3958124d412fee&v=4",
        status_id: 1,
        role_id: 1,
      },
    ],
  });

  const currencyTable: Prisma.BatchPayload = await prisma.currency.createMany({
    data: [
      {
        currency_id: 1,
        currency_code: "UGX",
        currency_name: "Uganda Shilling",
      },
      {
        currency_id: 2,
        currency_code: "USD",
        currency_name: "US Dollar",
      },
      {
        currency_id: 3,
        currency_code: "EUR",
        currency_name: "Euro",
      },
    ],
  });

  const unitTable: Prisma.BatchPayload = await prisma.unit.createMany({
    data: [
      {
        unit_id: 1,
        name: "Piece",
        short_name: "pc",
        unit_desc: "Unit representing a single item or object",
      },
      {
        unit_id: 2,
        name: "Box",
        short_name: "box",
      },
      {
        unit_id: 3,
        name: "Lump-sum",
        short_name: "",
        unit_desc: "",
      },
      {
        unit_id: 4,
        name: "Per Day",
        short_name: "",
        unit_desc: "",
      },
      {
        unit_id: 5,
        name: "Dozen",
        short_name: "doz",
        unit_desc: "A group of twelve (12)",
      },
      {
        unit_id: 6,
        name: "Pack",
        short_name: "pk",
        unit_desc: "Unit representing a group of items packaged together",
      },
      {
        unit_id: 7,
        name: "Kilogram",
        short_name: "kg",
        unit_desc: "Unit of mass in the metric system",
      },
      {
        unit_id: 8,
        name: "Gram",
        short_name: "g",
        unit_desc:
          "A smaller unit of mass in the metric system, equal to 1/1000 of a kilogram",
      },
      {
        unit_id: 9,
        name: "Meter",
        short_name: "m",
        unit_desc: "Base unit of length in the metric system",
      },
      {
        unit_id: 10,
        name: "Centimeter",
        short_name: "cm",
        unit_desc: "A unit of length equal to 1/100 of a meter",
      },
      {
        unit_id: 11,
        name: "Liter",
        short_name: "L",
        unit_desc:
          "Unit of volume in the metric system, commonly used for liquids",
      },
      {
        unit_id: 12,
        name: "Milliliter",
        short_name: "mL",
        unit_desc:
          "A smaller unit of volume in the metric system, equal to 1/1000 of a liter",
      },
    ],
  });

  const quotationTypeTable: Prisma.BatchPayload =
    await prisma.quotation_type.createMany({
      data: [
        {
          type_id: 1,
          name: "Supply of Products",
        },
        {
          type_id: 2,
          name: "Provision of Services",
        },
        {
          type_id: 3,
          name: "Supply of Products And Provision of Services",
        },
      ],
    });

  const quotationCategoryTable: Prisma.BatchPayload =
    await prisma.quotation_category.createMany({
      data: [
        {
          cat_id: 1,
          cat: "IT",
        },
        {
          cat_id: 2,
          cat: "Stationery",
        },
        {
          cat_id: 3,
          cat: "General",
        },
      ],
    });

  const quotationStatusTable: Prisma.BatchPayload =
    await prisma.quotation_status.createMany({
      data: [
        {
          status_id: 1,
          status: "created",
        },
        {
          status_id: 2,
          status: "sent",
        },
        {
          status_id: 3,
          status: "accepted",
        },
        {
          status_id: 4,
          status: "rejected",
        },
        {
          status_id: 5,
          status: "expired",
        },
      ],
    });

  const notificationTypesTable: Prisma.BatchPayload =
    await prisma.notification_type.createMany({
      data: [
        {
          id: 1,
          type: "General",
        },
        {
          id: 2,
          type: "Quotation Followup",
        },
      ],
    });

  const notificationTemplatesTable: Prisma.BatchPayload =
    await prisma.notification_template.createMany({
      data: [
        {
          id: 1,
          name: "firstTime_created",
          template:
            "Quotation {id} created for {client} on {date} needs to be followed up.",
        },
        {
          id: 2,
          name: "lastTime_created",
          template:
            "Quotation {id} created for {client} on {date} is about to expire. Please consider following up immediately.",
        },
        {
          id: 3,
          name: "firstTime_sent",
          template:
            "Quotation {id} sent to {client} on {date} is halfway to expiry. Kindly follow up with the client.",
        },
        {
          id: 4,
          name: "lastTime_sent",
          template:
            "Quotation {id} sent to {client} on {date} is nearing expiry. Please reach out to the client immediately.",
        },
      ],
    });

  const taskPriorityTable: Prisma.BatchPayload =
    await prisma.task_priority.createMany({
      data: [
        { id: 1, priority: "Urgent" },
        { id: 2, priority: "High" },
        { id: 3, priority: "Moderate" },
        { id: 4, priority: "Low" },
      ],
    });

  const taskStatusTable: Prisma.BatchPayload =
    await prisma.task_status.createMany({
      data: [
        { id: 1, status: "Pending" },
        { id: 2, status: "In-Progress" },
        { id: 3, status: "Stalled" },
        { id: 4, status: "Failed" },
        { id: 5, status: "Done" },
        { id: 6, status: "Completed" },
      ],
    });

  //Edmart Specific Data

  const companyTable: Prisma.BatchPayload = await prisma.company.createMany({
    data: [
      {
        co_id: 1,
        legal_name: "Edmart Systems (U) Limited",
        business_name: "Edmart Systems",
        tin: "1001260908",
        email: "info@edmartsystems.com",
        landline_number: "+256414697063",
        phone_number_1: "+256393255022",
        phone_number_2: "+256773410155",
        logo: "edmart_logo.png",
        web: "www.edmartsystems.com",
      },
    ],
  });

  const companyAddressTable: Prisma.BatchPayload =
    await prisma.company_address.createMany({
      data: [
        {
          co_ad_id: 1,
          co_id: 1,
          branch_number: "001",
          branch_name: "Head Office",
          box_number: "33884",
          street: "Nkrumah Road",
          plot_number: "29/29A",
          building_name: "Karobwa Towers",
          floor_number: 3,
          room_number: "F3-05",
          country: "Uganda",
          district: "Kampala",
          county: "Central",
          subcounty: "Kampala Central",
          village: "Nakasero",
        },
      ],
    });

  const bankTable: Prisma.BatchPayload = await prisma.bank.createMany({
    data: [
      {
        bank_id: 1,
        co_id: 1,
        name: "Stanbic Bank",
        branch_name: "Garden City",
        ac_title: "Edmart Systems (U) Limited",
        ac_number: "9030005790467",
      },
    ],
  });

  const quotationTcsTable: Prisma.BatchPayload =
    await prisma.quotation_tcs.createMany({
      data: [
        {
          tc_id: 1,
          quotation_type_id: 1,
          delivery_days: 2,
          delivery_words:
            "Within {delivery_days} days from the date of purchase order.",
          validity_days: 30,
          validity_words: "{validity_days} days.",
          payment_grace_days: 30,
          payment_words:
          // changed from payment_grace_days to payment_grace_days_phrase
          "{payment_grace_days_phrase} of the items and presentation of a tax invoice.", // <--- updated
          payment_method_words:
            "The payment shall be by Cheque, EFT or RTGS to our account with the following details:-",
          bank_id: 1,
        },
        {
          tc_id: 2,
          quotation_type_id: 2,
          delivery_days: 2,
          delivery_words:
            "Within {delivery_days} days from the date of purchase order.",
          validity_days: 30,
          validity_words: "{validity_days} days.",
          initial_payment_percentage: 70,
          last_payment_percentage: 30,
          payment_words:
            "{initial_payment_percentage}% on commissioning and {last_payment_percentage}% after completion of works.",
          payment_method_words:
            "The payment shall be by Cheque, EFT or RTGS to our account with the following details:-",
          bank_id: 1,
        },
        {
          tc_id: 3,
          quotation_type_id: 3,
          delivery_days: 2,
          delivery_words:
            "Within {delivery_days} days from the date of purchase order.",
          validity_days: 30,
          validity_words: "{validity_days} days.",
          initial_payment_percentage: 70,
          last_payment_percentage: 30,
          payment_words:
            "{initial_payment_percentage}% on commissioning and {last_payment_percentage}% after completion of works.",
          payment_method_words:
            "The payment shall be by Cheque, EFT or RTGS to our account with the following details:-",
          bank_id: 1,
        },
      ],
    });
  //Edmart Specific Data End
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
