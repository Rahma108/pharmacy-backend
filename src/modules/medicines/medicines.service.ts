import { BadRequestException, Injectable, NotFoundException , ServiceUnavailableException,} from '@nestjs/common';
import { MedicineRepository } from './medicines.repository';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { CategoryRepository } from '../categories/category.repository';



interface OpenFdaLabel {
  set_id?: string;
  effective_time?: string;
  drug_interactions?: string[];
  openfda?: {
    generic_name?: string[];
    brand_name?: string[];
  };
}

interface OpenFdaResponse {
  results?: OpenFdaLabel[];
}

@Injectable()
export class MedicinesService {
    constructor(
        private readonly medicineRepository: MedicineRepository,
        private readonly categoryRepository: CategoryRepository,
    ) {}
    async findAll(query: MedicineQueryDto) {
        const data = await this.medicineRepository.paginateMedicines(query);
        return {
        message: 'Medicines retrieved successfully',
        data,
        };
    }
    async findAllWithCategory() {
        const data = await this.medicineRepository.findAllWithCategory();
        return {
        message: 'Medicines with categories retrieved successfully',
        data,
        };
    }

    async findById(id: number) {
        const medicine = await this.medicineRepository.findById(id);

        if (!medicine) {
        throw new NotFoundException('Medicine not found ❕');
        }

        return {
        message: 'Medicine retrieved successfully',
        data: medicine,
        };
    }


    
async findAlternatives(id: number) {
        const medicine = await this.medicineRepository.findById(id);

        if (!medicine || medicine.deletedAt) {
            throw new NotFoundException('Active medicine not found');
        }

        const {
            activeIngredient,
            strength,
            dosageForm,
        } = medicine;

        if (!activeIngredient || !strength || !dosageForm) {
            throw new BadRequestException(
            'Medicine must have active ingredient, strength, and dosage form to find alternatives',
            );
        }

        const alternatives =
            await this.medicineRepository.findAlternatives({
            id: medicine.id,
            activeIngredient,
            strength,
            dosageForm,
            });

        return {
            message: 'Medicine alternatives retrieved successfully',
            data: {
            originalMedicine: {
                id: medicine.id,
                name: medicine.name,
                activeIngredient,
                strength,
                dosageForm,
            },
            alternatives,
            count: alternatives.length,
            note:
                'Potential matches only. A pharmacist must verify suitability before substitution.',
            },
        };
        }

        
async checkDrugInteractions(medicineIds: number[]) {
    if (
        !Array.isArray(medicineIds) ||
        medicineIds.length < 2 ||
        medicineIds.length > 10 ||
        new Set(medicineIds).size !== medicineIds.length ||
        medicineIds.some(
        (id) => !Number.isInteger(id) || id < 1,
        )
    ) {
        throw new BadRequestException(
        'Provide 2 to 10 unique, valid medicine IDs',
        );
    }

    const medicines = await Promise.all(
        medicineIds.map((id) =>
        this.medicineRepository.findById(id),
        ),
    );

    const invalidMedicineIndex = medicines.findIndex(
        (medicine) => !medicine || medicine.deletedAt,
    );

    if (invalidMedicineIndex !== -1) {
        throw new NotFoundException(
        `Medicine ID ${medicineIds[invalidMedicineIndex]} was not found or is inactive`,
        );
    }

    const validMedicines = medicines.filter(
        (medicine) => medicine != null,
    );

    const missingIngredient = validMedicines.find(
        (medicine) => !medicine.activeIngredient?.trim(),
    );

    if (missingIngredient) {
        throw new BadRequestException(
        `Active ingredient is missing for medicine ID ${missingIngredient.id}`,
        );
    }

    const ingredients = [
        ...new Set(
        validMedicines.map(
            (medicine) => medicine.activeIngredient!.trim(),
        ),
        ),
    ];

    const labelsByIngredient = new Map<
    string,
    OpenFdaLabel[]
  >();

  await Promise.all(
        ingredients.map(async (ingredient) => {
        const labels =
            await this.fetchOpenFdaLabels(ingredient);

        labelsByIngredient.set(
            ingredient.toLowerCase(),
            labels,
        );
        }),
    );

    const pairs: {
    medicines: {
        id: number;
        name: string;
        activeIngredient: string;
    }[];
    status:
        | 'interactionMentioned'
        | 'noMentionFound'
        | 'insufficientData';
    findings: ReturnType<
        MedicinesService['findLabelMentions']
    >;
    note: string;
    }[] = [];

  for (let i = 0; i < validMedicines.length; i++) {
    for (
      let j = i + 1;
      j < validMedicines.length;
      j++
    ) {
      const first = validMedicines[i];
      const second = validMedicines[j];

      const firstIngredient =
        first.activeIngredient!.trim();
      const secondIngredient =
        second.activeIngredient!.trim();

      const firstLabels =
        labelsByIngredient.get(
          firstIngredient.toLowerCase(),
        ) ?? [];

      const secondLabels =
        labelsByIngredient.get(
          secondIngredient.toLowerCase(),
        ) ?? [];

      const findings = [
        ...this.findLabelMentions(
          firstLabels,
          secondIngredient,
          first,
        ),
        ...this.findLabelMentions(
          secondLabels,
          firstIngredient,
          second,
        ),
      ];

    const hasInteractionSection = (labels: OpenFdaLabel[]) =>
      labels.some((label) =>
        (label.drug_interactions ?? []).some(
          (section) =>
            typeof section === 'string' &&
            section.trim().length > 0,
        ),
      );

    const firstHasInteractionSection =
      hasInteractionSection(firstLabels);

    const secondHasInteractionSection =
      hasInteractionSection(secondLabels);

    let status:
      | 'interactionMentioned'
      | 'noMentionFound'
      | 'insufficientData';

    if (findings.length > 0) {
      status = 'interactionMentioned';
    } else if (
      firstLabels.length > 0 &&
      secondLabels.length > 0 &&
      firstHasInteractionSection &&
      secondHasInteractionSection
    ) {
      status = 'noMentionFound';
    } else {
      status = 'insufficientData';
    }



      pairs.push({
        medicines: [
          {
            id: first.id,
            name: first.name,
            activeIngredient: firstIngredient,
          },
          {
            id: second.id,
            name: second.name,
            activeIngredient: secondIngredient,
          },
        ],
        status,
        findings,
        note:
          status === 'interactionMentioned'
            ? 'A drug label mentions the other ingredient. Review the source and consult a pharmacist.'
            : status === 'noMentionFound'
              ? 'No mention was found in the available drug-interaction sections. This does not establish that the combination is safe.'
              : 'There is insufficient label data to assess this pair.',
      });



    }
  }

  return {
    message: 'Drug interaction label check completed',
    source: 'openFDA Drug Label API',
    data: {
      pairs,
      disclaimer:
        'This is a preliminary label-text check, not a comprehensive drug interaction checker or a clinical safety determination.',
    },
  };
}

private async fetchOpenFdaLabels(
  activeIngredient: string,
): Promise<OpenFdaLabel[]> {
  const escapedIngredient = activeIngredient
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

  const url = new URL(
    'https://api.fda.gov/drug/label.json',
  );

  url.searchParams.set(
    'search',
    `openfda.generic_name:"${escapedIngredient}"`,
  );
  url.searchParams.set('limit', '5');

  let response: Response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new ServiceUnavailableException(
      'The drug label source is temporarily unavailable',
    );
  }

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new ServiceUnavailableException(
      'Unable to retrieve drug labels from openFDA',
    );
  }

  const body =
    (await response.json()) as OpenFdaResponse;

  return body.results ?? [];
}

private findLabelMentions(
  labels: OpenFdaLabel[],
    targetIngredient: string,
    sourceMedicine: {
        id: number;
        name: string;
    },
    ) {
    const findings: {
        medicineId: number;
        medicineName: string;
        mentionedIngredient: string;
        section: string;
        excerpt: string;
        sourceUrl: string | null;
        labelEffectiveDate: string | null;
    }[] = [];

    const escapedTarget = targetIngredient
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const pattern = new RegExp(
        `(^|[^a-z0-9])(${escapedTarget})(?=$|[^a-z0-9])`,
        'i',
    );

    for (const label of labels) {
        for (const section of label.drug_interactions ?? []) {
        const match = pattern.exec(section);

        if (!match) {
            continue;
        }

        const matchIndex =
            match.index + match[1].length;

        const start = Math.max(0, matchIndex - 120);

        findings.push({
            medicineId: sourceMedicine.id,
            medicineName: sourceMedicine.name,
            mentionedIngredient: targetIngredient,
            section: 'Drug Interactions',
            excerpt: section.slice(start, start + 300),
            sourceUrl: label.set_id
            ? `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${encodeURIComponent(label.set_id)}`
            : null,
            labelEffectiveDate: label.effective_time ?? null,
        });
        }
    }

    return findings;
}


    async create(data: CreateMedicineDto) {
        const medicine =
        await this.medicineRepository.createMedicine(data);

        return {
        message: 'Medicine created successfully',
        data: medicine,
        };
    }

    async update(id: number, data: UpdateMedicineDto) {
        const medicine = await this.medicineRepository.findById(id);

        if (!medicine) {
        throw new NotFoundException('Medicine not found ❕');
        }

        const updatedMedicine =
        await this.medicineRepository.update(id, data);

        return {
        message: 'Medicine updated successfully',
        data: updatedMedicine,
        };
    }

    async softDelete(id: number) {
        const medicine =
        await this.medicineRepository.findActiveById(id);

        if (!medicine) {
        throw new NotFoundException('Medicine not found ❕');
        }

        const data = await this.medicineRepository.softDelete(id);

        return {
        message: 'Medicine deleted successfully',
        data,
        };
    }

    async restore(id: number) {
        const medicine =
        await this.medicineRepository.findById(id);

        if (!medicine) {
        throw new NotFoundException('Medicine not found ❕');
        }

        if (!medicine.deletedAt) {
        throw new BadRequestException(
            'Medicine is already active ✅',
        );
        }

        const data = await this.medicineRepository.restore(id);

        return {
        message: 'Medicine restored successfully',
        data,
        };
    }

    async hardDelete(id: number) {
        const medicine =
        await this.medicineRepository.findById(id);

        if (!medicine) {
        throw new NotFoundException('Medicine not found ❕');
        }

        const data =
        await this.medicineRepository.hardDelete(id);

        return {
        message: 'Medicine permanently deleted successfully',
        data,
        };
    }
    }