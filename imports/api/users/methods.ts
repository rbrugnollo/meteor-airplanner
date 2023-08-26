import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { Meteor } from "meteor/meteor";

interface InsertUserVm {
  readonly email: string;
  readonly name: string;
  readonly roles: string[];
}

interface UpdateUserVm {
  readonly _id: string;
  readonly email: string;
  readonly name: string;
  readonly roles: string[];
}

Meteor.methods({
  async "users.insert"(data: InsertUserVm) {
    const userId = await Accounts.createUserAsync({
      username: data.email,
      email: data.email,
      profile: { name: data.name, roles: data.roles },
    });
    Roles.setUserRoles(userId, data.roles);
    Accounts.sendEnrollmentEmail(userId);
  },
  "users.update"(data: UpdateUserVm) {
    const { _id, ...updateData } = data;
    const userProps = {
      username: updateData.email,
      profile: {
        name: updateData.name,
        roles: updateData.roles,
      },
      "emails.0.address": updateData.email,
    };

    Meteor.users.update({ _id: _id }, { $set: userProps });
    Roles.setUserRoles(_id, updateData.roles);
  },
  "users.getOne"(userId) {
    return Meteor.users.findOne(userId);
  },
});
