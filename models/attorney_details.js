'use strict';
module.exports = (sequelize, DataTypes) => {
  var attorney_details = sequelize.define('attorney_details', {
    group: DataTypes.STRING,
    section: DataTypes.STRING,
    designation: DataTypes.STRING,
    attorney_id: DataTypes.INTEGER,
    attorney_code: DataTypes.STRING,
    attorney_type: DataTypes.STRING,
    education: DataTypes.STRING,
    bar_registration: DataTypes.STRING,
    job_type: DataTypes.STRING,
    bar_practice_date: DataTypes.DATE,
    firm_join_date: DataTypes.DATE,
    jurisdiction: DataTypes.STRING,
    industry_type: DataTypes.STRING,
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
    remarks: DataTypes.STRING,
    user_id: DataTypes.INTEGER

  }, {});
  attorney_details.associate = function(models) {
    // associations can be defined here
  };
  return attorney_details;
};
