import type { Schema, Struct } from '@strapi/strapi';

export interface GradeSubjectEntry extends Struct.ComponentSchema {
  collectionName: 'components_grade_subject_entries';
  info: {
    description: 'A grade and attendance entry for a subject';
    displayName: 'Subject Entry';
  };
  attributes: {
    attended: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    grade: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    subject: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'grade.subject-entry': GradeSubjectEntry;
    }
  }
}
