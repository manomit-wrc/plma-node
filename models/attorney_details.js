'use strict';
module.exports = (sequelize, DataTypes) => {
  var attorney_details = sequelize.define('attorney_details', {
    group: DataTypes.INTEGER,
    section: DataTypes.INTEGER,
    designation: DataTypes.INTEGER,
    attorney_id: DataTypes.STRING,
    attorney_code: DataTypes.STRING,
    attorney_type: DataTypes.STRING,
    education: DataTypes.STRING,
    bar_registration: DataTypes.STRING,
    job_type: DataTypes.STRING,
    bar_practice_date: DataTypes.DATE,
    firm_join_date: DataTypes.DATE,
    jurisdiction: DataTypes.INTEGER,
    industry_type: DataTypes.INTEGER,
    hourly_cost: DataTypes.STRING,
    benefit_factor: DataTypes.STRING,
    overhead_amount: DataTypes.STRING,
    billing_opp_cost: DataTypes.STRING,
    address2: DataTypes.STRING,
    address3: DataTypes.STRING,
    phone_no: DataTypes.STRING,
    e_mail: DataTypes.STRING,
    fax: DataTypes.STRING,
    website_url: DataTypes.STRING,
    social_url: DataTypes.STRING,
    remarks: DataTypes.TEXT,
    user_id: DataTypes.INTEGER
    // firm_id: DataTypes.INTEGER

  }, {});
  attorney_details.associate = function(models) {
    // associations can be defined here
  };
  return attorney_details;
};
