import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer

def improved_engineer_features(df):
    """Enhanced feature engineering with text features and better encoding."""
    print("Performing improved feature engineering...")
    
    # Make a copy of the dataframe
    df_engineered = df.copy()
    
    # 1. Create age groups (categorical bins)
    if 'Age (years)' in df_engineered.columns:
        df_engineered['Age_Group'] = pd.cut(
            df_engineered['Age (years)'], 
            bins=[0, 1, 3, 7, 12, 20],
            labels=['Puppy/Kitten', 'Young', 'Adult', 'Senior', 'Geriatric']
        )
    
    # 2. Create weight categories
    if 'Weight (kg)' in df_engineered.columns:
        df_engineered['Weight_Category'] = pd.cut(
            df_engineered['Weight (kg)'],
            bins=[0, 2, 5, 10, 20, 50],
            labels=['Tiny', 'Small', 'Medium', 'Large', 'Giant']
        )
    
    # 3. Extract text features from symptoms using bag of words
    if 'Symptoms' in df_engineered.columns:
        try:
            # Use CountVectorizer to create bag-of-words features from symptoms
            vectorizer = CountVectorizer(max_features=50, stop_words='english')
            
            # Handle NaN values
            symptoms = df_engineered['Symptoms'].fillna('')
            
            # Create symptom features
            symptom_features = vectorizer.fit_transform(symptoms)
            symptom_feature_names = [f'Symptom_{word}' for word in vectorizer.get_feature_names_out()]
            
            # Convert to DataFrame and join with original data
            symptom_df = pd.DataFrame(
                symptom_features.toarray(),
                columns=symptom_feature_names,
                index=df_engineered.index
            )
            df_engineered = pd.concat([df_engineered, symptom_df], axis=1)
            
            print(f"Added {len(symptom_feature_names)} symptom text features")
        except Exception as e:
            print(f"Warning: Could not process symptom text features: {str(e)}")
    
    # 4. Create interaction features between important variables
    if 'Age (years)' in df_engineered.columns and 'Weight (kg)' in df_engineered.columns:
        df_engineered['Age_Weight_Ratio'] = df_engineered['Age (years)'] / (df_engineered['Weight (kg)'] + 0.1)
    
    # 5. One-hot encode categorical variables with limited cardinality
    categorical_cols = []
    if 'Pet Species' in df_engineered.columns:
        categorical_cols.append('Pet Species')
    if 'Age_Group' in df_engineered.columns:
        categorical_cols.append('Age_Group')
    if 'Weight_Category' in df_engineered.columns:
        categorical_cols.append('Weight_Category')
    
    for col in categorical_cols:
        if col in df_engineered.columns:
            try:
                dummies = pd.get_dummies(df_engineered[col], prefix=col, drop_first=False)
                df_engineered = pd.concat([df_engineered, dummies], axis=1)
                print(f"One-hot encoded {col} with {df_engineered[col].nunique()} unique values")
            except Exception as e:
                print(f"Warning: Could not one-hot encode {col}: {str(e)}")
    
    # 6. For high-cardinality categorical features, use frequency encoding
    high_cardinality_cols = []
    if 'Breed' in df_engineered.columns:
        high_cardinality_cols.append('Breed')
    if 'Past Diagnosis' in df_engineered.columns:
        high_cardinality_cols.append('Past Diagnosis')
    
    for col in high_cardinality_cols:
        if col in df_engineered.columns:
            try:
                # Calculate frequency of each category
                frequency = df_engineered[col].value_counts(normalize=True)
                # Map frequencies back to the dataframe
                df_engineered[f'{col}_Frequency'] = df_engineered[col].map(frequency)
                print(f"Frequency encoded {col} with {df_engineered[col].nunique()} unique values")
            except Exception as e:
                print(f"Warning: Could not frequency encode {col}: {str(e)}")
    
    # 7. Create interaction between Age and Past Diagnosis if available
    if 'Age (years)' in df_engineered.columns and 'Past Diagnosis' in df_engineered.columns:
        try:
            # Get top 5 most common past diagnoses
            top_diagnoses = df_engineered['Past Diagnosis'].value_counts().nlargest(5).index
            
            # Create binary indicators for top diagnoses
            for diagnosis in top_diagnoses:
                df_engineered[f'Had_{diagnosis}'] = (df_engineered['Past Diagnosis'] == diagnosis).astype(int)
                
                # Create interaction with age
                df_engineered[f'Age_Had_{diagnosis}'] = df_engineered['Age (years)'] * df_engineered[f'Had_{diagnosis}']
            
            print(f"Created interaction features for top {len(top_diagnoses)} past diagnoses")
        except Exception as e:
            print(f"Warning: Could not create diagnosis interaction features: {str(e)}")
    
    # Drop original categorical columns that have been encoded
    columns_to_drop = categorical_cols + high_cardinality_cols
    columns_to_drop = [col for col in columns_to_drop if col in df_engineered.columns]
    df_engineered = df_engineered.drop(columns=columns_to_drop)
    
    print(f"Improved feature engineering complete. New shape: {df_engineered.shape}")
    return df_engineered