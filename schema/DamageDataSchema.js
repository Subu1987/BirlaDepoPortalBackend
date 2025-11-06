const mongo = require("mongoose");

const damageDataSchema = new mongo.Schema(
  {
    USER_ID: {
      type: String,
      required: true,
    },
    USER_NAME: {
      type: String,
      required: true,
    },
    // rake handing data
    COMPLETION_TIME: {
      type: String,
      default: "",
    },
    DATE_OF_RAKE_COMPLETION: {
      type: String,
      default: "",
    },
    DATE_OF_RAKE_RECEIVED: {
      type: String,
      default: "",
    },
    DEPOT: {
      type: String,
      default: "",
    },
    DEPOT_NAME: {
      type: String,
      default: "",
    },
    DIRECT_SALE_FROM_SIDING: {
      type: String,
      default: "",
    },
    DOCUMENT: [Object],
    HANDLING_PARTY: {
      type: String,
      default: "",
    },
    HANDLING_PARTY_PHONE_NO: {
      type: String,
      default: "",
    },
    HANDLING_PARTY_CODE: {
      type: String,
      default: "",
    },
    IM_DATE_FROM: {
      type: String,
      default: "",
    },
    IM_DATE_TO: {
      type: String,
      default: "",
    },
    QTY_SHIFTED_TO_GODOWN: {
      type: String,
      default: "",
    },
    RECEIVE_TIME: {
      type: String,
      default: "",
    },
    RR_DATE: {
      type: String,
      default: "",
    },
    RR_NO: {
      type: String,
      required: true,
      unique: true,
    },
    RAKE_NO: {
      type: String,
      default: "",
    },
    RR_QTY: {
      type: String,
      default: "",
    },
    RR_TYPE: {
      type: String,
      default: "",
    },
    WAGON_TRANSIT: {
      type: String,
      default: "",
    },
    WAGON_TYPE: {
      type: String,
      default: "",
    },
    // rake damage data
    DAMAGE_DATA: [Object],

    // claim insurance
    CLAIM_AMOUNT: {
      type: Number,
      default: 0,
    },
    CLAIM_DATE: {
      type: String,
      default: "",
    },
    CLAIM_NO: {
      type: String,
      default: "",
    },
    CLAIM_QTY: {
      type: Number,
      default: 0,
    },
    CLAIM_STATUS: {
      type: String,
      default: "",
    },
    CLAIM_INTIMATION_STATUS: {
      type: String,
      default: "",
    },

    MAT_DOC_NO: {
      type: String,
      default: "",
    },

    MIGO_POSTING_DATA: {
      type: Object,
      default: null,
    },

    MIGO_RETURN_DATA: {
      type: Object,
      default: null,
    },

    MIGO_RETURN_COMMIT: {
      type: Object,
      default: null,
    },

    // APPROVAL
    APPROVED_CS: {
      type: String,
      default: null,
    },
    CS_COMMENT: {
      type: String,
      default: "",
    },

    APPROVED_BH: {
      type: String,
      default: null,
    },
    BH_COMMENT: {
      type: String,
      default: "",
    },

    APPROVED_LG: {
      type: String,
      default: null,
    },
    LG_COMMENT: {
      type: String,
      default: "",
    },

    APPROVED_SA: {
      type: String,
      default: null,
    },
    SA_COMMENT: {
      type: String,
      default: "",
    },

    // change log
    CHANGE_LOG: [Object],
  },
  {
    timestamps: true,
  }
);

module.exports = mongo.model("DamageData", damageDataSchema);
