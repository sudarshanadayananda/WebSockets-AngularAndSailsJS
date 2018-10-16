/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var ERROR = { status: 'ERROR' };
var SUCCESS = { status: 'SUCCESS' };

module.exports = {

  /**
   *  Add user
   */
  createUser: function (req, res) {

    var name = req.body.name;

    User.findOne({ name: name }).exec(function (err, user) {

      if (err) {

        return res.serverError(ERROR);
      }

      if (!user) {

        User.create({ name: name }).exec(function (err, newUser) {

          if (err) {

            return res.serverError(ERROR);
          }

          if (newUser) {

            /**
             * Notify connected socket clients about new record creation on User model
             */
            User.publishCreate(newUser);
            return res.send({ status: 'SUCCESS', data: newUser });
          }
        });
      }
    });
  },

  /**
   *  Update user
   */
  updateUser: function (req, res) {

    var id = req.body.id;
    var name = req.body.name;

    User.update({ id: id }, { name: name }).exec(function (err, updatedUser) {

      if (err) {

        return res.serverError(ERROR);
      }

      if (updatedUser) {

        /**
         * Notify connected socket clients about User model update
         */
        User.publishUpdate(updatedUser[0].id, updatedUser[0]);
        return res.send({ status: 'SUCCESS', data: updatedUser });
      }
    });
  },

  /**
   *  Delete user
   */
  deleteUser: function (req, res) {

    var id = req.param('id');

    User.destroy({ id: id }).exec(function (err, deletedUser) {

      if (err) {

        return res.serverError(ERROR);
      }
      /**
       * Notify connected socket clients about record delete on User model
       */
      User.publishDestroy(deletedUser[0].id);
      return res.send(SUCCESS);
    });
  },

  /**
   *  Get users
   * 
   */
  getUsers: function (req, res) {

    User.find().exec(function (err, users) {

      if (err) {

        return res.serverError(ERROR);
      }
      return res.send({ status: 'SUCCESS', data: users });
    });
  },

  /**
   * subscribe real time model events of User to connect socket client
   * 
   * @param req :: socket request
   *
   */
  subscribe: function (req, res) {

    if (!req.isSocket) {

      return res.badRequest({ status: 'NOT_SOCKET_REQUEST' });
    }
    User.find().exec(function (err, users) {

      if (err) {

        return res.serverError({ status: 'SERVER_ERROR' });
      }
      /**
       * subscribe the User model to connected client sockets
       */
      User.subscribe(req, _.pluck(users, 'id'));

      /**
       * Needed for receiving broadcasts every time publishCreate() is called on User model
       */
      User.watch(req);
      return res.ok({ status: 'SUBSCRIBED' });
    });
  }
};

