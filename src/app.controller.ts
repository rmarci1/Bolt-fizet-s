import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { Webshopdto } from './webshopdto';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('webshop')
  getwebshop() {
    return {
      errors: []
    };
  }

  @Post()
  async getWeboldal(@Res() response: Response, @Body() szamladto: Webshopdto) {
    let errors: string[] = [];
    
    if (!szamladto.nev || !szamladto.szamlaszam || !szamladto.szerzodesi_feltetel) {
      errors.push("Minden mezőt ki kell tölteni!");
    }

    let count: number = 0;
    for (let index = 0; index < szamladto.nev.length; index++) {
      if (szamladto.nev[index] != ' ') {
        count++;
      }
    }

    if (!(/^\d{8}-\d{8}$/.test(szamladto.szamlaszam) || /^\d{8}-\d{8}-\d{8}$/.test(szamladto.szamlaszam))) {
      errors.push("A bankszámlaszámnak 2x8 vagy 3*8 számjegynek kell lennie kötőjellel elválasztva");
    }

    if (count == 0) {
      errors.push("A névnek minimum tartalmaznia kell egy, nem szóköz jellegű karaktert!");
    }

    if (errors.length > 0) {
      response.render('webshop', {
        errors
      });
      return;
    }
    const csvLine = `${szamladto.nev},${szamladto.szamlaszam},${szamladto.szerzodesi_feltetel==true?"igen":"nem"}\n`;
    
    // CSV fájlba írás
    const csvFilePath = path.join(__dirname,'..', 'adatok.csv');

    fs.appendFile(csvFilePath, csvLine, (err) => {
      if (err) {
        console.error('Hiba a fájlba íráskor:', err);
        response.status(500).send('Hiba történt a fájlba íráskor.');
        return;
      }
    });
    response.redirect("/openAccountSuccess");
  }

  @Get('openAccountSuccess')
  openAccountSuccess() {
    return 'Sikeres létrehozás';
  }
}
