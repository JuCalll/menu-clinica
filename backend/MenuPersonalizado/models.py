from django.db import models
from pacientes.models import Paciente

class MenuPersonalizado(models.Model):
    fecha = models.DateField()
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    adicional_diario = models.CharField(max_length=50, blank=True)
    observaciones = models.TextField(blank=True)
    firma = models.BooleanField(default=False)

    # ALGO (media mañana)
    algo_cereal = models.BooleanField(default=False)
    algo_sandwich = models.BooleanField(default=False)
    algo_tostada = models.BooleanField(default=False)
    algo_barrita = models.BooleanField(default=False)
    algo_cafe_leche = models.BooleanField(default=False)
    algo_leche = models.BooleanField(default=False)
    algo_jugo_agua = models.BooleanField(default=False)
    algo_aromatica = models.BooleanField(default=False)

    # ONCES (tarde)
    onces_cafe_galletas = models.BooleanField(default=False)
    onces_batido = models.BooleanField(default=False)
    onces_fruta = models.BooleanField(default=False)
    onces_leche_entera = models.BooleanField(default=False)
    onces_leche_deslactosada = models.BooleanField(default=False)
    onces_azucar = models.BooleanField(default=False)
    onces_endulzante = models.BooleanField(default=False)

    # DESAYUNO
    desayuno_jugo_fruta = models.BooleanField(default=False)
    desayuno_fruta = models.BooleanField(default=False)
    desayuno_huevo_maicitos = models.BooleanField(default=False)
    desayuno_huevo_revueltos = models.BooleanField(default=False)
    desayuno_huevo_entero = models.BooleanField(default=False)
    desayuno_queso_cuajada = models.BooleanField(default=False)
    desayuno_arepa_blanca = models.BooleanField(default=False)
    desayuno_pan = models.BooleanField(default=False)
    desayuno_galletas = models.BooleanField(default=False)
    desayuno_tostada = models.BooleanField(default=False)
    desayuno_jugo_fruta_bebida = models.BooleanField(default=False)
    desayuno_chocolate = models.BooleanField(default=False)
    desayuno_cafe = models.BooleanField(default=False)
    desayuno_aromatica_bebida = models.BooleanField(default=False)
    desayuno_en_leche = models.BooleanField(default=False)
    desayuno_en_agua = models.BooleanField(default=False)

    # ALMUERZO
    almuerzo_consome = models.BooleanField(default=False)
    almuerzo_sopa = models.BooleanField(default=False)
    almuerzo_pechuga = models.BooleanField(default=False)
    almuerzo_atun = models.BooleanField(default=False)
    almuerzo_carne_res = models.BooleanField(default=False)
    almuerzo_pescado = models.BooleanField(default=False)
    almuerzo_papa = models.BooleanField(default=False)
    almuerzo_platano = models.BooleanField(default=False)
    almuerzo_arroz = models.BooleanField(default=False)
    almuerzo_vegetales_crudos = models.BooleanField(default=False)
    almuerzo_vegetales_calientes = models.BooleanField(default=False)
    almuerzo_jugo_fruta = models.BooleanField(default=False)
    almuerzo_leche = models.BooleanField(default=False)
    almuerzo_aromatica = models.BooleanField(default=False)
    almuerzo_golosina = models.BooleanField(default=False)

    # CENA
    cena_consome = models.BooleanField(default=False)
    cena_sopa = models.BooleanField(default=False)
    cena_pechuga = models.BooleanField(default=False)
    cena_atun = models.BooleanField(default=False)
    cena_carne_res = models.BooleanField(default=False)
    cena_pescado = models.BooleanField(default=False)
    cena_papa = models.BooleanField(default=False)
    cena_platano = models.BooleanField(default=False)
    cena_arroz = models.BooleanField(default=False)
    cena_vegetales_crudos = models.BooleanField(default=False)
    cena_vegetales_calientes = models.BooleanField(default=False)
    cena_agua_panela = models.BooleanField(default=False)
    cena_jugo_fruta = models.BooleanField(default=False)
    cena_leche = models.BooleanField(default=False)
    cena_aromatica = models.BooleanField(default=False)

    def __str__(self):
        return f"MenuPersonalizado para {self.paciente.name} el {self.fecha}"