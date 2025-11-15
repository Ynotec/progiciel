from odoo import models, fields

class RentalProperty(models.Model):
    _inherit = 'product.template'

    guest_capacity = fields.Integer(string="Nombre maximum d'invités")
    number_of_bed = fields.Integer(string="Nombre de lits")
    number_of_bedrooms = fields.Integer(string="Nombre de chambres")
    number_of_bathrooms = fields.Integer(string="Nombre de salles de bain")

    street = fields.Char(string="Rue")
    number_house = fields.Char(string="Numéro de maison")
    postal_code = fields.Char(string="Code postal")

    climatization = fields.Boolean(string="Climatisation")
    terrace = fields.Boolean(string="Terrasse")
    garden = fields.Boolean(string="Jardin")
    swimming_pool = fields.Boolean(string="Piscine")
    jacuzzi = fields.Boolean(string="Jacuzzi")
    charge_ev = fields.Boolean(string="Charge EV")
    indoor_fireplace = fields.Boolean(string="Cheminée intérieure")
    outdoor_fireplace = fields.Boolean(string="Cheminée extérieure")
    dedicated_workspace = fields.Boolean(string="Espace de travail dédié")
    gym = fields.Boolean(string="Salle de sport")

    toilet_grab_bar = fields.Boolean(string="Barre d'appui pour toilettes")
    shower_grab_bar = fields.Boolean(string="Barre d'appui pour douche")
    shower_free_access = fields.Boolean(string="Douche accessible sans marche")
    shower_seat = fields.Boolean(string="Siège de douche")
    bedroom_free_access = fields.Boolean(string="Chambre accessible sans marche")
    bedroom_large_door = fields.Boolean(string="Porte large de chambre")
    general_free_access = fields.Boolean(string="Accès général sans marche")


    