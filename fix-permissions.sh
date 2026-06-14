#!/bin/bash
cd /var/www/prepacameroun/server

# Créer les dossiers s'ils n'existent pas
mkdir -p uploads/images/prepas
mkdir -p uploads/images/disciplines

# Corriger les permissions
sudo chown -R ubuntu:ubuntu uploads/
sudo chmod -R 755 uploads/

# Permissions spéciales pour l'écriture
sudo chmod -R 775 uploads/images/

echo "Permissions corrigées pour le dossier uploads"
